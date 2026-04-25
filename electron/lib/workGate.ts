import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

export class WorkGate {
  private started = false;

  start(): void {
    this.started = true;
  }

  stop(): void {
    this.started = false;
  }

  isStarted(): boolean {
    return this.started;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    workGate: WorkGate;
  }
}

const workGatePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('workGate', new WorkGate());
};

export default fp(workGatePlugin, { name: 'work-gate' });
