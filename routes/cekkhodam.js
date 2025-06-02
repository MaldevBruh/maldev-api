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
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            result: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            message: { type: 'string' },
          },
          example: {
            ok: false,
            message: 'Something went wrong'
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { name } = request.query;
      const data = await cekKhodam(name);
      return data;
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
      message: e.message
    }
  }
}