import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/search/bingsearch',
    schema: {
      description: 'Searching from Bing Search',
      tags: ['Search'],
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      }
    },
    handler: async (request, reply) => {
      const { query } = request.query;
      if(!query) return reply.code(400).send({
        ok: false,
        message: 'Please input parameter "query"'
      });
      const data = await bingSearch(query);
      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    },
  });
}

async function bingSearch(query) {
  try {
    const { data } = await axios.get(`https://www.bing.com/search`, {
      params: {
        q: query
      },
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    const result = [];
    $('li.b_algo').each((_, e) => {
      const url = $(e).find('h2 a').attr('href');
      const title = $(e).find('h2 a').text().trim();
      const summary = $(e).find('p').text().trim();
      result.push({
        title,
        summary,
        url
      });
    });
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
