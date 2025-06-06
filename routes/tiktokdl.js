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
      if(!url) return reply.code(400).send({
        ok: false,
        message: 'Please input parameter "url"'
      });
      const data = await ssstik(url);
      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
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

    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        const { data } = await axios.post('https://ssstik.io/abc?url=dl', form, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://ssstik.io',
            'Referer': 'https://ssstik.io/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
          }
        });

        const $res = cheerio.load(data);
        const linkmp4 = $res('a.without_watermark').attr('href');
        const linkmp3 = $res('a.music').attr('href');

        if (linkmp4) {
          return {
            ok: true,
            type: 'video',
            result: {
              linkmp4: linkmp4 || 'Unknown',
              linkmp3: linkmp3 || 'Unknown'
            }
          };
        }

        const result = [];
        $res('img[data-splide-lazy]').each((_, e) => {
          const slides = $res(e).attr('data-splide-lazy');
          if (slides) result.push(slides);
        });

        if (result.length > 0) {
          return {
            ok: true,
            type: 'image',
            result
          };
        }

      } catch (err) {
        if (attempt >= 10) throw err;
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }

    return {
      ok: false,
      message: 'Failed to fetch data after 10 attempts.'
    };
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.response?.data || e.message || e
    };
  }
}