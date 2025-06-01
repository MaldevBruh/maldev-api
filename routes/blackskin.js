import axios from 'axios';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/ai/blackskin',
    schema: {
      description: 'Change character skin to black',
      tags: ['AI'],
      querystring: {
        type: 'object',
        properties: {
          imageUrl: { type: 'string' },
        },
        required: ['imageUrl'],
      },
      response: {
        200: {
          description: 'Image file',
          type: 'string',
          contentMediaType: 'image/png',
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
      const { imageUrl } = request.query;
      const data = await blackskin(imageUrl);
      
      if(!data.ok) return reply.code(500).send({ ok: false, message: data.message });

      reply
        .header('Content-Type', 'image/png')
        .send(data.result);
    },
  });
}

async function blackskin(imageUrl, filter = 'hitam') {
  try {
    const { data: imageUrlData } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageData = Buffer.from(imageUrlData).toString('base64');
  
    const { data } = await axios.post('https://negro.consulting/api/process-image', { imageData, filter });
  
    const base64Image = data.processedImageUrl.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    return {
      ok: true,
      result: imageBuffer
    }
  }
  catch(e) {
    return {
      ok: false,
      message: e.message
    }
  }
}