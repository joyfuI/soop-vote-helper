import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/vote/start', async () => {
    fastify.workGate.start();
  });

  fastify.post('/api/vote/stop', async () => {
    fastify.workGate.stop();
  });

  fastify.post('/api/vote/clear', async () => {
    fastify.sqlite.run('DELETE FROM chat;');
  });
};

export default routes;
