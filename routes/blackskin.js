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
      }
    },
    handler: async (request, reply) => {
      const { imageUrl } = request.query;
      if(!imageUrl) return reply.code(400).send({
        ok: false,
        message: 'Please input parameter "imageUrl"'
      });
      const data = await blackskin(imageUrl);
      
      if(!data.ok) return reply.code(500).send(data);

      reply
        .code(200)
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
      message: e.response?.data?.error || e.message
    }
  }
}