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
      try {
        const { prompt } = request.query;
        const data = await openAI(prompt);
        return {
          ok: true,
          result: data
        };
      } catch (error) {
        return {
          ok: false,
          message: error.message || 'Unknown error'
        }
      }
    },
  });
}

async function openAI(content) {
  const url = 'https://chatbot-ji1z.onrender.com/chatbot-ji1z';

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Origin': 'https://seoschmiede.at',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.3'
  }

  const { data } = await axios.post(url, `{"messages":[{"role":"user","content":"${content}"}]}`, { headers });

  return data.choices[0].message.content;
}
