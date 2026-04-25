import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import * as z from 'zod';

const routes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get(
    '/api/chat/list',
    {
      schema: {
        querystring: z.object({
          limit: z.coerce.number().int().min(1).default(20),
        }),
      },
    },
    async (request) => {
      const { limit } = request.query;
      return fastify.sqlite.all<Record<string, string>>(
        `
SELECT id, streamerId, receivedTime, username, userId, comment
FROM chat
ORDER BY receivedTime DESC, id DESC
LIMIT :limit;
`,
        { limit },
      );
    },
  );

  fastify.get('/api/chat/vote/result', async () => {
    return fastify.sqlite.all<Record<string, number>>(
      `
WITH latest_vote AS (
  SELECT
    userId,
    comment
  FROM (
    SELECT
      userId,
      comment,
      ROW_NUMBER() OVER (
        PARTITION BY userId
        ORDER BY receivedTime DESC, id DESC
      ) AS rn
    FROM chat
  )
  WHERE rn = 1
)
SELECT
  comment,
  COUNT(*) AS voteCount
FROM latest_vote
GROUP BY comment
ORDER BY voteCount DESC, comment ASC;
`,
    );
  });
};

export default routes;
