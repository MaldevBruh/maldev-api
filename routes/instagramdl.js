import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/downloader/instagramdl',
    schema: {
      description: 'Download Instagram video',
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
      const data = await kolIg(url);
      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    },
  });
}

async function kolIg(url) {
  try {
    const html = await axios.get('https://kol.id/download-video/instagram', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
      }
    });
    const $ = cheerio.load(html.data);
    const token = $('input[name=_token]').attr('value');
    const cookie = html.headers['set-cookie'].map(v => v.split(';')[0]).join('; ');
    
    const form = qs.stringify({
      url: url,
      _token: token
    });
    
    const response = await axios.post('https://kol.id/download-video/instagram', form, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'cookie': cookie,
        'origin': 'https://kol.id',
        'referer': 'https://kol.id/download-video/instagram',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
      }
    });
    const $2 = cheerio.load(response.data.html);
    const title = $2('.small-title').text().trim();
    const link = $2('a.btn-instagram').attr('href');
    return {
      ok: true,
      result: {
        title: title || 'Unknown',
        link: link || 'Unknown'
      }
    }
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    }
  }
}