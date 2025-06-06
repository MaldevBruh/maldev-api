import axios from 'axios';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/random/lahelu',
    schema: {
      description: 'Get random meme from lahelu',
      tags: ['Random']
    },
    handler: async (request, reply) => {
      const data = await lahelu();
      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    },
  });
}

async function lahelu() {
  const randomNumber = Math.floor(Math.random() * 101).toString();
  const apiUrl = 'https://lahelu.com/api/post/get-recommendations?field=5&cursor=' + randomNumber;

  try {
    const { data } = await axios.get(apiUrl);
    const postInfos = data.postInfos || [];

    if (postInfos.length === 0) {
      return { ok: false, message: 'No recommendations found.' };
    }

    const randomIndex = Math.floor(Math.random() * postInfos.length);
    const res = postInfos[randomIndex];

    if (!res) {
      return { ok: false, message: 'No post found at selected index.' };
    }

    return {
      ok: true,
      result: {
        title: res.title || '',
        media: res.media || ''
      }
    };
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    };
  }
}
