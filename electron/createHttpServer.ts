import path from 'node:path';
import fastifyStatic from '@fastify/static';
import { app, ipcMain } from 'electron';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

import chatRoutes from './chat';
import fastifyNodeSqlite from './lib/fastifyNodeSqlite';
import workGate from './lib/workGate';
import soopRoutes, { handleChat } from './soop';
import storeRoutes from './store';
import voteRoutes from './vote';

const createHttpServer = (rendererDist?: string) => {
  const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  if (rendererDist) {
    fastify.register(fastifyStatic, { root: rendererDist });
  }

  fastify.register(storeRoutes);
  fastify.register(soopRoutes);
  fastify.register(voteRoutes);
  fastify.register(chatRoutes);

  fastify.register(fastifyNodeSqlite, {
    path: path.join(app.getPath('userData'), `${app.getName()}.db`),
    wal: true,
    allowBareNamedParameters: true,
    setup: (db) => {
      db.exec(`
CREATE TABLE IF NOT EXISTS chat (
  id INTEGER PRIMARY KEY,
  streamerId TEXT NOT NULL,
  receivedTime TEXT NOT NULL,
  username TEXT NOT NULL,
  userId TEXT NOT NULL,
  comment TEXT NOT NULL
);
`);
    },
  });

  fastify.register(workGate);

  // test
  ipcMain.on('testChat', (_event, streamerId, userId, comment, username) => {
    handleChat(fastify, streamerId, {
      receivedTime: new Date().toISOString(),
      username: username ?? userId,
      userId,
      comment,
    });
  });

  return fastify;
};

export default createHttpServer;
