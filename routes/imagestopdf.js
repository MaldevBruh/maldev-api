import axios from 'axios';
import FormData from 'form-data';

async function imageToPdf(...urls) {
  try {
    if(urls.length === 0) throw new Error('Parameter is missing');

    const files = [];
    for(const [i, url] of urls.entries()) {
      const { data: buffer } = await axios.get(url, { responseType: 'arraybuffer' });

      const form = new FormData();
      form.append('file', buffer, `image${i}.jpg`);

      const response = await axios.post('https://filetools1.pdf24.org/client.php?action=upload', form, { headers: form.getHeaders() });
      files.push(response.data[0]);
    }
    
    const form = {
      files,
      rotations: new Array(files.length).fill(0),
      joinFiles: true,
      createBookmarks: false,
      pageSize: 'A4',
      pageOrientation: 'auto',
      margin: '0'
    };

    const response = await axios.post('https://filetools1.pdf24.org/client.php?action=imagesToPdf', form);

    return {
      ok: true,
      result: `https://filetools1.pdf24.org/client.php?mode=download&action=downloadJobResult&jobId=${response.data.jobId}`
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
    url: '/api/tools/imagestopdf',
    schema: {
      description: 'Convert image URLs to PDF',
      tags: ['Tools'],
      querystring: {
        type: 'object',
        properties: {
          image_url: {
            type: 'array',
            items: { type: 'string', default: '' }
          }
        },
        required: ['image_url']
      }
    },
    handler: async(req, reply) => { 
      const urls = Array.isArray(req.query.image_url) ? req.query.image_url : [req.query.image_url];

      const data = await imageToPdf(...urls);
      return reply.send(data);
    }
  });
}