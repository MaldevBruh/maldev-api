import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/downloader/aiodl',
    schema: {
      description: 'Social Media Video Downloader (X, Twitter, Instagram, Facebook, TikTok, LinkedIn)',
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
      const data = await squidlr(url);
      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    },
  });
}

async function squidlr(url) {
  try {
    const { data } = await axios.get(`https://www.squidlr.com/download?url=${encodeURIComponent(url)}`);
    const $ = cheerio.load(data);
    const title = $('p.content-text').text().trim();
    const author = $('footer.blockquote-footer').text().trim().split('\n')[0];
    let views,
      likes;
    $('li.list-inline-item').each((_, e) => {
      const small = $(e).find('small').text().trim();
      const value = $(e).find('strong').text().trim();
      if(small === 'Views') views = value;
      if(small === 'Likes') likes = value;
    });
    const uploadDate = $('time').text().trim();
    const duration = $('.card-text li.list-inline-item').eq(0).text().trim();
    const link = $('.list-group a').attr('href');
    return {
      ok: true,
      result: {
        title: title || 'Unknown',
        author: author || 'Unknown',
        views: views || 'Unknown',
        likes: likes || 'Unknown',
        uploadDate: uploadDate || 'Unknown',
        duration: duration || 'Unknown',
        link: link || 'Unknown'
      }
    }
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.response?.data || e.message || e
    }
  }
}
