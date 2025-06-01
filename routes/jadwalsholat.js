import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/search/jadwalsholat',
    schema: {
      description: 'Dapatkan waktu sholat pada seluruh kota di Indonesia',
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
      const data = await jadwalSholat(query);
      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    }
  });
}

async function jadwalSholat(kota) {
  try {
    if(!kota) throw new Error('Masukkan query berupa kota');
    const { data: a } = await axios.get('https://www.jadwalsholat.org/adzan/data/town.php?q=' + kota);
    if(a.length === 0) throw new Error('Kota tidak ditemukan');
    const { data: b } = await axios.get('https://www.jadwalsholat.org/adzan/monthly.php?id=' + a[0].id);
    const $ = cheerio.load(b);
    const res = [];
    $('.praytime-item').each((_, el) => {
      const element = $(el);
      if (!element.hasClass('hidden')) {
          const nama = element.find('p').first().text().trim();
          const waktu = element.find('.schedule-time').text().trim();
          res.push({ nama, waktu });
      }
    });
    return {
      ok: true,
      result: {
        kota: a[0].name,
        jadwalsholat: res
      },
      creator: 'MaldevBruh'
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message
    }
  }
}
