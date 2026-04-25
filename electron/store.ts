import { app } from 'electron';
import type { Schema } from 'electron-store';
import Store from 'electron-store';
import type { FastifyPluginAsync } from 'fastify';
import * as z from 'zod';

import type { DotPath, DotPathValue } from '../src/types';

const zodSchema = z.object({
  tab: z.number().default(0),
  streamerIds: z.array(z.string()).default([]),
  votingItems: z
    .record(z.string(), z.object({ name: z.string(), color: z.string() }))
    .default({}),
});

const jsonSchema = z.toJSONSchema(zodSchema);

export type StoreType = z.infer<typeof zodSchema>;
type StoreKey = DotPath<StoreType>;
type StoreValue = DotPathValue<StoreType, StoreKey>;

let store: Store<StoreType> | null = null;
const getStore = () => {
  if (store) {
    return store;
  }
  store = new Store<StoreType>({
    schema: jsonSchema.properties as Schema<StoreType>,
    name: app.getName(),
    cwd: process.env.PORTABLE_EXECUTABLE_DIR ?? process.env.APP_ROOT,
    clearInvalidConfig: true,
  });
  return store;
};

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.delete('/api/store', async () => {
    getStore().clear();
  });

  fastify.get<{ Params: { key: StoreKey } }>(
    '/api/store/:key',
    async (request) => {
      const { key } = request.params;
      return getStore().get(key);
    },
  );

  fastify.put<{ Params: { key: StoreKey }; Body: StoreValue }>(
    '/api/store/:key',
    async (request) => {
      const { key } = request.params;
      getStore().set(key, request.body);
    },
  );

  fastify.delete<{ Params: { key: StoreKey } }>(
    '/api/store/:key',
    async (request) => {
      const { key } = request.params;
      getStore().delete(key);
    },
  );
};

export default routes;
