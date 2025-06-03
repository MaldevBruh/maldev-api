import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/downloader/tiktokdl',
    schema: {
      description: 'TikTok Link (Support image and video)',
      tags: ['Downloader'],
      querystring: {
        type: 'object',
        properties: {
          url: { type: 'string' },
        },
        required: ['url'],
      }
    },
    handler: async (request, reply) => {
      const { url } = request.query;
      const data = await ssstik(url);
      if(!data.ok) return reply.code(500).send(data);
      return reply.send(data);
    },
  });
}

async function ssstik(url) {
  try {
    const { data: html } = await axios.get('https://ssstik.io/');
    const $ = cheerio.load(html);
    let s_tt = null;

    $('script').each((_, el) => {
      const scriptContent = $(el).html();
      if (scriptContent && scriptContent.includes('s_tt')) {
        const match = scriptContent.match(/s_tt\s*=\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
          s_tt = match[1];
          return false;
        }
      }
    });

    const form = qs.stringify({
      id: url,
      locale: 'en',
      tt: s_tt
    });

    let attempt = 0;
    let videoResult = null;

    while (attempt < 10 && !videoResult) {
      attempt++;
      try {
        const { data } = await axios.post('https://ssstik.io/abc?url=dl', form, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://ssstik.io',
            'Referer': 'https://ssstik.io/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
          }
        });

        const $2 = cheerio.load(data);
        const linkmp4 = $2('a.without_watermark').attr('href');
        const linkmp3 = $2('a.music').attr('href');

        if (linkmp4) {
          videoResult = {
            ok: true,
            type: 'video',
            result: {
              linkmp4: linkmp4 || 'Unknown',
              linkmp3: linkmp3 || 'Unknown'
            }
          };
        }
      } catch (err) {
        if (attempt >= 10) throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }

    if (videoResult) return videoResult;

    const { data: fallbackData } = await axios.post('https://ssstik.io/abc?url=dl', form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://ssstik.io',
        'Referer': 'https://ssstik.io/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
      }
    });

    const $3 = cheerio.load(fallbackData);
    const result = [];

    $3('img[data-splide-lazy]').each((_, e) => {
      const slides = $3(e).attr('data-splide-lazy');
      if (slides) result.push(slides);
    });

    return {
      ok: true,
      type: 'image',
      result
    };
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.response?.data || e.message || e
    };
  }
}