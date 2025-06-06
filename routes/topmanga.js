import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/discovery/topmanga',
    schema: {
      description: 'Get top manga list from MAL',
      tags: ['Discovery']
    },
    handler: async (request, reply) => {
      const data = await topmanga();

      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    },
  });
}

async function topmanga() {
  try {
    const { data } = await axios.get('https://myanimelist.net/topmanga.php?type=manga');
    const $ = cheerio.load(data);
    let res = [];
    $('tr.ranking-list').each((i, el) => {
      const title = $(el).find('img').attr('alt').split('Manga:')[1].trim();
      const rating = $(el).find('span.score-label').text().trim().replace(/n\/a/gi, '');
      const link = $(el).find('a.fl-l').attr('href');
      res.push({ rank: i + 1, title, rating, link });
    });
    return {
      ok: true,
      result: res
    };
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    }
  }
}
