import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let fastify;

export default async function handler(req, res) {
  if (!fastify) {
    fastify = Fastify({ logger: true });

    fastify.get('/', async(req, reply) => {
      try {
        const html = await readFile(path.join(__dirname, 'public', 'home.html'), 'utf-8');
        reply.type('text/html').send(html);
      } catch (e) {
        reply.code(500).send('Internal server error');
      }
    });

    fastify.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      const missingField = error.validation?.[0]?.params?.missingProperty;
      return reply.status(400).send({
        ok: false,
        message: missingField
          ? `Parameter "${missingField}" is required`
          : 'Bad Request',
      });
    }
  
    reply.status(500).send({
      ok: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  });

    fastify.setNotFoundHandler(async (request, reply) => {
      try {
        const html = await readFile(path.join(__dirname, 'public', '404.html'), 'utf-8');
        reply.type('text/html').code(404).send(html);
      } catch (err) {
        reply.code(500).send('Internal Server Error');
      }
    });

    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Maldev API',
          version: '1.0.0',
        },
      },
    });

    await fastify.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        layout: 'BaseLayout'
      },
      theme: {
        title: 'Maldev API',
        css: [
          {
            filename: 'custom.css',
            content: `
              body {
                background: url('https://www.gramedia.com/blog/content/images/2024/11/Screenshot-2024-11-29-104124.png') no-repeat center center fixed;
                background-size: cover;
              }
              
              body::before {
                content: "";
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: -1;
              }
              
              .swagger-ui {
                background: transparent !important;
              }
            `
          }
        ]
      },
    });
    
    fastify.addHook('onSend', async (request, reply, payload) => {
      if (
        request.raw.url === '/docs' &&
        reply.getHeader('content-type')?.includes('text/html')
      ) {
        return payload.toString().replace(
          '<head>',
          `<head><meta name="viewport" content="width=device-width, initial-scale=1">`
        );
      }
      if (reply.getHeader('content-type')?.includes('application/json')) {
        try {
          const json = JSON.parse(payload);
          return JSON.stringify(json, null, 2);
        } catch (err) {
          return payload;
        }
      }
      return payload;
    });

    const routesPath = path.join(__dirname, 'routes');
    const files = await readdir(routesPath);
    for (const file of files) {
      try {
        const route = await import(`./routes/${file}`);
        await fastify.register(route.default);
        console.log(`✅ Route ${file} registered`);
      } catch (e) {
        console.error(`❌ Error register route ${file}:`, err);
      }
    }

    await fastify.ready();
  }

  fastify.server.emit('request', req, res);
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
