import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';

async function spotifyDownloader(url) {
  try {
    if(!url) throw new Error('Parameter url is required');
    const form = qs.stringify({ url });
    const { data } = await axios.post('https://spotifydownloader.pro/', form);
    const $ = cheerio.load(data);
    const result = $('td a.rb_btn').attr('href');
    if(!result) throw new Error('Download link not found');
    return {
      ok: true,
      result
    };
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    };
  }
}

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/downloader/spotifydl',
    schema: {
      description: 'Spotify Link Downloader',
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
      const data = await spotifyDownloader(url);
      return reply.send(data);
    },
  });
}
