import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/fun/cekkhodam',
    schema: {
      description: 'cek khodam lu',
      tags: ['Fun'],
      querystring: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      }
    },
    handler: async (request, reply) => {
      const { name } = request.query;
      if(!name) return reply.code(400).send({
        ok: false,
        message: 'Please input parameter "name"'
      });
      const data = await cekKhodam(name);
      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    },
  });
}

async function cekKhodam(name) {
  try {
    const apiUrl = `https://khodam.vercel.app/v2?nama=${name}&_rsc=1iwkq`;
    const { data } = await axios.get(apiUrl);
    const $ = cheerio.load(data);
    const res = $('.result p').last().text().trim().replace(/✨/g, '');
    return {
      ok: true,
      result: res
    }
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    }
  }
}