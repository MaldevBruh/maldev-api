import axios from 'axios';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/ai/arting',
    schema: {
      description: 'Create an AI Image from prompt (Arting AI)',
      tags: ['AI'],
      querystring: {
        type: 'object',
        properties: {
          prompt: { type: 'string', default: 'Badass man' },
          model_id: {
            type: 'string',
            enum: ['mistoonJade_v10Anime', 'divineanimemix_V2', 'animatedModelsOf_31', 'cuteAnime_v10', 'SDXLFaetastic_v24', 'pastelMixPrunedFP16', 'cyberrealisticSemi_v30', 'cyberrealisticPony_v65', 'divineelegancemix_V10', 'maturemalemix_v14', 'asyncsMIX_v7', 'furworldFurry', 'comicBabes_v2', 'absolutereality_v181', 'fuwafuwamix_v15BakedVae2', 'ghostmix_v20Bakedvae'],
            default: 'mistoonJade_v10Anime'
          },
          negative_prompt: { type: 'string', default: 'painting, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, deformed, ugly, blurry, bad anatomy, bad proportions, extra limbs, cloned face, skinny, glitchy, double torso, extra arms, extra hands, mangled fingers, missing lips, ugly face, distorted face, extra legs' },
          width: {
            type: 'integer',
            minimum: 64,
            maximum: 2048,
            default: 1024
          },
          height: {
            type: 'integer',
            minimum: 64,
            maximum: 2048,
            default: 1024
          }
        },
        required: ['prompt']
      },
      response: {
        200: {
          description: 'OK',
          content: {
            'image/png': {
              schema: {
                type: 'string',
                default: 'binary'
              }
            }
          }
        },
        400: {
          description: 'Bad Request',
          type: 'object',
          properties: {
            ok: { type: 'boolean', default: false },
            message: { type: 'string', default: 'An error occurred' }
          }
        },
        500: {
          description: 'Internal Server Error',
          type: 'object',
          properties: {
            ok: { type: 'boolean', default: false },
            message: { type: 'string', default: 'An error occurred' }
          }
        }
      }
    },
    handler: async(request, reply) => {
      const { prompt, model_id, negative_prompt, width, height } = request.query;
      if(!prompt) return reply.code(400).send({
        ok: false,
        message: 'Please input parameter "prompt"'
      });
      const data = await artingAi(prompt, model_id, negative_prompt, width, height);
      if(!data.ok) return reply.code(500).send(data);
      const response = await axios.get(data.result, { responseType: 'arraybuffer' });
      reply.code(200).header('Content-Type', 'image/png').send(response.data);
    }
  });
}

async function artingAi(prompt, model_id, negative_prompt, width, height) {
  try {
    const form = JSON.stringify({
      prompt: prompt,
      model_id: model_id,
      samples: 1,
      height: height,
      width: width,
      negative_prompt: negative_prompt,
      seed: -1,
      lora_ids: '',
      lora_weight: '0.7',
      sampler: 'Euler a',
      steps: 25,
      guidance: 7,
      clip_skip: 2
    });
    const response = await axios.post('https://api.arting.ai/api/cg/text-to-image/create', form, {
      headers: {
        'content-type': 'application/json',
        'origin': 'https://arting.ai',
        'referer': 'https://arting.ai/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
      }
    });

    for(let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const form2 = JSON.stringify({
        request_id: response.data.data.request_id
      });
      const response2 = await axios.post('https://api.arting.ai/api/cg/text-to-image/get', form2, {
        headers: {
          'content-type': 'application/json',
          'origin': 'https://arting.ai',
          'referer': 'https://arting.ai/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
        }
      });
      if(response2.data.data.output.length) return {
        ok: true,
        result: response2.data.data.output[0]
      }
    }
    
    return {
      ok: false,
      result: 'Timeout has been reached'
    }
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.message
    }
  }
}