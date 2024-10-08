import axios from 'axios';
import cheerio from 'cheerio';

export default async function plugin(fastify, opts) {
  fastify.get('/api/tiktok', {
    schema: {
      description: 'Download video from tiktok',
      tags: ['Downloader'],
      summary: 'Return a Tiktok Video URL',
      querystring: {
        url: { type: 'string', description: 'The URL for tiktok downloader' },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'boolean' },
            result: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const url = request.query.url;
    const tiktok = await ssstikFunction(url);

    if (tiktok.status) {
      return reply.type('application/json').send(JSON.stringify({
        status: true,
        result: tiktok.result
      }, null, 2));
    } else {
      return reply.status(500).type('application/json').send(JSON.stringify({
        status: false,
        message: tiktok.message
      }, null, 2));
    }
  });
}

async function ssstikFunction(url) {
  const data = new URLSearchParams();
  data.append('id', url);
  data.append('locale', 'en');
  data.append('tt', 'djRjTmpl');

  const headers = {
    "Accept": "*/*",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Origin": "https://ssstik.io",
    "Referer": "https://ssstik.io/en-1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  }

  try {
    const res = await axios.post('https://ssstik.io/abc?url=dl', data.toString(), { headers });
    const $ = cheerio.load(res.data);
    const linkmp4 = $('a.without_watermark').attr('href');
    const linkmp3 = $('a.download_link.music').attr('href');
    const caption = $('.maintext').text();
    const thumbnail = $('style').html().match(/background-image:\s*url\((.*?)\)/)[1];
    return {
      status: true,
      result: {
        linkmp4,
        linkmp3,
        caption,
        thumbnail
      }
    }
  } catch (e) {
    return {
      status: false,
      message: e.message
    }
  }
}