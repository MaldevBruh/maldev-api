import axios from 'axios';

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

async function clipToYt(url) {
  try {
    if(!url) throw new Error('Parameter url is required');
    const form = JSON.stringify({ url });
    const { data } = await axios.post('https://www.clipto.com/api/youtube', form, {
      headers: {
        'content-type': 'application/json',
        'origin': 'https://www.clipto.com',
        'referer': 'https://www.clipto.com/media-downloader/youtube-downloader',
        'user-agent': userAgent
      }
    });
    const { success, ...rest } = data;
    return {
      ok: true,
      result: rest
    };
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    };
  }
}

export default async function fastify(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/downloader/youtubedl',
    schema: {
      description: 'Download video & audio from YouTube',
      tags: ['Downloader'],
      querystring: {
        type: 'object',
        properties: {
          url: { type: 'string', default: 'https://youtu.be/QrvrQO1pJ_Y?si=D9jFdDlD5Lxsv62k' }
        },
        required: ['url']
      }
    },
    handler: async(req, reply) => {
      const { url } = req.query;
      const data = await clipToYt(url);
      return reply.send(data);
    }
  });
}