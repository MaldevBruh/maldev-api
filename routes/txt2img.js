import axios from 'axios';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/ai/txt2img',
    schema: {
      description: 'Create an image from prompt',
      tags: ['AI'],
      querystring: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
        },
        required: ['prompt'],
      }
    },
    handler: async (request, reply) => {
      const { prompt } = request.query;
      if(!prompt) return reply.code(400).send({
        ok: false,
        message: 'Please input parameter "prompt"'
      });
      const data = await hf_txt2img(prompt);
      if(!data.ok) return reply.code(500).send(data);
      
      const imageResponse = await axios.get(data.result, { responseType: 'arraybuffer' });
        reply
          .code(200)
          .header('Content-Type', 'image/png')
          .send(imageResponse.data);
    }
  });
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function hf_txt2img(prompt) {
  const randomString = generateRandomString(5);
  let attempts = 0;
  let res;
  do {
    if(attempts > 5) break;
    attempts++;
    try {
      const { data: data1 } = await axios.post('https://m-ric-text-to-image.hf.space/queue/join?__theme=light', {
        data: [prompt],
        event_data: null,
        fn_index: 0,
        trigger_id: 10,
        session_hash: randomString
      });
      const { data } = await axios.get('https://m-ric-text-to-image.hf.space/queue/data?session_hash=' + randomString);
      const result = data.match(/"url":"(.*?)"/)?.[1];
      res = {
        ok: true,
        result
      }
  
    } catch (e) {
      res = {
        ok: false,
        message: e.response?.data?.error || e.message
      }
    }
    if(!res.ok) console.log('Retrying...');
  } while(!res.ok);
  return res;
}