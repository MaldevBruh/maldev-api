import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

async function aiVoiceGenerator(text, language = 'en-US') {
  try {
    if(!text) throw new Error('Parameter text is required');
    if(!language) throw new Error('Parameter language is required');
    const html = await axios.get('https://aivoicegenerator.com/', {
      headers: {
        'user-agent': userAgent
      }
    })
    const cookie = html.headers['set-cookie'].map(v => v.split(';')[0]).join('; ');
    const $ = cheerio.load(html.data);
    const csrf_test_name = $('input[name=csrf_test_name]').attr('value');
    const form = qs.stringify({
      csrf_test_name,
      front_tryme_language: language,
      front_tryme_voice: 'QObKyouBVf49fcda7e728e3b7f01158e4e5312774JvLByN4n0_standard',
      front_tryme_text: text
    });
    const { data } = await axios.post('https://aivoicegenerator.com/home/tryme_action/', form, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'cookie': cookie,
        'origin': 'https://aivoicegenerator.com',
        'referer': 'https://aivoicegenerator.com/',
        'user-agent': userAgent
      }
    });
    return {
      ok: true,
      result: data.tts_uri
    };
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    }
  }
}

export default async function fastify(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/ai/voice',
    schema: {
      description: 'Get AI Voice',
      tags: ['AI'],
      querystring: {
        type: 'object',
        properties: {
          text: { type: 'string', default: 'Hello, I\'m MaldevBruh' },
          language: { type: 'string', default: 'en-US' }
        },
        required: ['text', 'language']
      },
    },
    handler: async(req, reply) => {
      const { text, language } = req.query;
      const data = await aiVoiceGenerator(text, language);
      const { data: audioBuffer } = await axios.get(data.result, {
        responseType: 'arraybuffer'
      });
      return reply.type('audio/mpeg').send(audioBuffer);
    }
  });
}