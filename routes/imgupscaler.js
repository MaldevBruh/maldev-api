import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

async function imageUpscaler(imageUrl, ratio = '200%') {
  try {
    if(!imageUrl) throw new Error('Paramater "url" is required');
    if(!ratio) throw new Error('Parameter "ratio" is required');
    ratio = Number(ratio.replace('%', '')) / 100;
    const { data: imageBuffer } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const ext = (await fileTypeFromBuffer(imageBuffer)).ext;
    const form = new FormData();
    form.append('myfile', imageBuffer, `${Date.now()}.${ext}`);
    form.append('scaleRadio', ratio);
    const { data: uploadData } = await axios.post('https://get1.imglarger.com/api/UpscalerNew/UploadNew', form, {
      headers: {
        'content-type': 'multipart/form-data',
        'origin': 'https://imgupscaler.com',
        'referer': 'https://imgupscaler.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
      }
    });
    if(uploadData.code !== 200 || uploadData.msg !== 'Success') throw new Error('Error while uploading file');
    const json = JSON.stringify({
      code: uploadData.data.code,
      scaleRadio: ratio
    });
    let status = 'waiting';
    let finalData;
    while(status === 'waiting') {
      const { data: response } = await axios.post('https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew', json, {
        headers: {
          'content-type': 'application/json',
          'origin': 'https://imgupscaler.com',
          'referer': 'https://imgupscaler.com/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
        }
      });
      finalData = response;
      status = finalData.data.status;
      await new Promise(r => setTimeout(r, 1000));
    }
    return {
      ok: true,
      result: finalData.data
    }
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
    url: '/api/ai/imgupscaler',
    schema: {
      description: 'Increase the quality of your image',
      tags: ['AI'],
      querystring: {
        type: 'object',
        properties: {
          image_url: {
            type: 'string'
          },
          ratio: {
            type: 'string',
            enum: ['200%', '400%'],
            default: '200%'
          }
        },
        required: ['image_url', 'ratio']
      }
    },
    handler: async(request, reply) => {
      const { image_url, ratio } = request.query;
      const data = await imageUpscaler(image_url, ratio);
      const { data: imageBuffer } = await axios.get(data.result.downloadUrls[0], {
        responseType: 'arraybuffer'
      });
      return reply.type(`image/${data.result.imagemimetype}`).send(imageBuffer);
    }
  });
}