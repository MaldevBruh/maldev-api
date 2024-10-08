import axios from 'axios';

export default async function plugin(fastify, opts) {
  fastify.get('/api/flux', {
    schema: {
      description: 'Generate Image using Flux',
      tags: ['AI'],
      summary: 'Return a flux image',
      querystring: {
        prompt: { type: 'string', description: 'The prompt for generate image' },
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
    const prompt = request.query.prompt;
    const flux = await generateFluxImage(prompt);

    if (flux.status) {
      return reply.type('application/json').send(JSON.stringify({
        status: true,
        result: flux.result
      }, null, 2));
    } else {
      return reply.status(500).type('application/json').send(JSON.stringify({
        status: false,
        message: flux.message
      }, null, 2));
    }
  });
}

async function generateFluxImage(prompt) {
  const url = 'https://websim.ai/api/image_gen';
  const headers = {
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://websim.ai',
    'referer': 'https://websim.ai/c/xTlURHyzK8sRkKovE',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
  }
  try {
    const { data } = await axios.post(url, {
      prompt,
      width: 1024,
      height: 1024,
      site_id: 'xTlURHyzK8sRkKovE',
      image_id: 148282854,
      src: 'https://picsum.photos/800/800?random=0.6376885910964529',
      html: '<html><head><style>html{min-height:100%}</style></head><body></body></html>',
      forceRegenerate: false
    }, {
      headers
    });

    return {
      status: true,
      result: data.url
    }
  } catch (e) {
    return {
      status: false,
      message: e.message
    }
  }
}