import Fastify from 'fastify';
import fastifySwagger from 'fastify-swagger';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 3000;

fastify.register(fastifySwagger, {
  routePrefix: '/docs',
  swagger: {
    info: {
      title: 'Maldev API',
      description: 'API documentation for Maldev API',
      version: '1.0.0',
    },
    host: 'api-maldev.vercel.app',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
  exposeRoute: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadPlugins = async (folder) => {
  const pluginFiles = readdirSync(folder).filter(file => file.endsWith('.js'));
  for (const file of pluginFiles) {
    const plugin = await import(join(folder, file));
    fastify.register(plugin.default);
  }
};

await loadPlugins(join(__dirname, 'plugins'));

const start = async () => {
  try {
    await fastify.listen({ port: PORT });
    console.log(`Server is running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();