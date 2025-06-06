import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/discovery/topanime',
    schema: {
      description: 'Get top anime list from MAL',
      tags: ['Discovery']
    },
    handler: async (request, reply) => {
      const data = await topanime();

      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    },
  });
}

async function topanime() {
  try {
    const { data } = await axios.get('https://myanimelist.net/topanime.php');
    const $ = cheerio.load(data);
    const result = [];
    $('tr.ranking-list').each((i, el) => {
      const title = $(el).find('h3.fl-l').text().trim();
      const rating = $(el).find('td.score').text().trim();
      const link = $(el).find('a.fl-l').attr('href');
      result.push({
        rank: i + 1,
        title,
        rating,
        link
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
    }
  }
}
