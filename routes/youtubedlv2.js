import axios from 'axios';

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

function getYouTubeVideoId(url) {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function yt1s(url, fileType = 'MP3') {
  try {
    if(!url) throw new Error('Parameter url is required');
    if(fileType !== 'MP3' && fileType !== 'MP4') throw new Error('Valid fileType: MP3 or MP4');
    const id = getYouTubeVideoId(url);
    const form = JSON.stringify({
      id,
      fileType
    });
    let status = 'processing';
    let response;
    while(status === 'processing') {
      response = await axios.post('https://ht.flvto.online/converter', form, {
        headers: {
          'content-type': 'application/json',
          'origin': 'https://ht.flvto.online',
          'referer': `https://ht.flvto.online/widget?url=${url}`,
          'user-agent': userAgent
        }
      });
      status = response.data.status;
      await new Promise(r => setTimeout(r, 500));
    }
    const data = response.data;
    if(fileType === 'MP3') return {
      ok: true,
      result: {
        title: data.title,
        duration: data.duration,
        file_size: data.filesize,
        url: data.link
      }
    };
    if(fileType === 'MP4') return {
      ok: true,
      result: {
        title: data.title,
        duration: Number(data.formats[0].approxDurationMs) / 1000,
        file_size: Number(data.formats[0].contentLength),
        url: data.formats[0].url
      }
    };
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    };
  }
}

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/downloader/youtubedlv2',
    schema: {
      description: 'Download video & audio from YouTube',
      tags: ['Downloader'],
      querystring: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            default: 'https://youtu.be/QrvrQO1pJ_Y?si=D9jFdDlD5Lxsv62k'
          },
          file_type: {
            type: 'string',
            enum: ['MP3', 'MP4'],
            default: 'MP3'
          }
        },
        required: ['url', 'file_type']
      }
    },
    handler: async(req, reply) => {
      const { url, file_type } = req.query;
      const data = await yt1s(url, file_type);
      return reply.send(data);
    }
  });
}