import axios from 'axios';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/ai/openai',
    schema: {
      description: 'OpenAI from prompt',
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
      const data = await openAI(prompt);
      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    },
  });
}

async function openAI(content) {
  try {
    const url = 'https://chatbot-ji1z.onrender.com/chatbot-ji1z';

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'https://seoschmiede.at',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.3'
    }
  
    const { data } = await axios.post(url, `{"messages":[{"role":"user","content":"${content}"}]}`, { headers });
  
    return {
      ok: true,
      result: data.choices[0].message.content
    }
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    }
  }
}