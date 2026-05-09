import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/api/vote/start', async () => {
    fastify.workGate.start();
  });

  fastify.get('/api/vote/start', async () => {
    return fastify.workGate.isStarted();
  });

  fastify.post('/api/vote/stop', async () => {
    fastify.workGate.stop();
  });

  fastify.post('/api/vote/clear', async () => {
    fastify.sqlite.run('DELETE FROM chat;');
  });
};

export default routes;
