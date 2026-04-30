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
    return fastify.sqlite.all<Record<string, string>>(
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

  fastify.get(
    '/api/chat/vote/history',
    {
      schema: {
        querystring: z.object({
          windowMinutes: z.coerce.number().int().min(1).default(10),
        }),
      },
    },
    async (request) => {
      const { windowMinutes } = request.query;
      return fastify.sqlite.all<Record<string, string>>(
        `
WITH RECURSIVE
params(windowMinutes) AS (
  SELECT CASE
    WHEN CAST(:windowMinutes AS INTEGER) > 0 THEN CAST(:windowMinutes AS INTEGER)
    ELSE 10
  END
),

base AS (
  SELECT id, userId, comment, receivedTime, strftime('%Y-%m-%dT%H:%M:00Z', receivedTime) AS minute
  FROM chat
),

bounds AS (
  SELECT MAX(unixepoch(minute)) AS endTs, MAX(unixepoch(minute)) - ((SELECT windowMinutes FROM params) - 1) * 60 AS startTs
  FROM base
),

ranked AS (
  SELECT *, ROW_NUMBER() OVER (
    PARTITION BY userId, minute
    ORDER BY receivedTime DESC, id DESC
  ) AS rn
  FROM base
),

per_user_minute AS (
  SELECT userId, minute, comment
  FROM ranked
  WHERE rn = 1
),

changes AS (
  SELECT userId, minute, comment, LAG(comment) OVER (
    PARTITION BY userId
    ORDER BY minute
  ) AS prevComment
  FROM per_user_minute
),

delta AS (
  SELECT minute, comment, 1 AS delta
  FROM changes
  WHERE prevComment IS NULL OR prevComment <> comment

  UNION ALL

  SELECT minute, prevComment AS comment, -1 AS delta
  FROM changes
  WHERE prevComment IS NOT NULL AND prevComment <> comment
),

delta_by_minute AS (
  SELECT minute, comment, SUM(delta) AS delta
  FROM delta
  GROUP BY minute, comment
),

-- 최근 n분 시작 시점 이전까지의 누적 상태
initial AS (
  SELECT delta.comment, SUM(delta.delta) AS voteCountBefore
  FROM delta
  CROSS JOIN bounds
  WHERE unixepoch(delta.minute) < bounds.startTs
  GROUP BY delta.comment
),

minutes(ts, minute) AS (
  SELECT startTs, strftime('%Y-%m-%dT%H:%M:00Z', startTs, 'unixepoch')
  FROM bounds
  WHERE startTs IS NOT NULL

  UNION ALL

  SELECT ts + 60, strftime('%Y-%m-%dT%H:%M:00Z', ts + 60, 'unixepoch')
  FROM minutes, bounds
  WHERE ts + 60 <= bounds.endTs
),

-- 최근 n분 구간에서 필요 있는 선택지만 생성
choices AS (
  SELECT comment
  FROM initial
  WHERE voteCountBefore <> 0

  UNION

  SELECT delta.comment
  FROM delta
  CROSS JOIN bounds
  WHERE unixepoch(delta.minute) BETWEEN bounds.startTs AND bounds.endTs
),

grid AS (
  SELECT minutes.minute, choices.comment
  FROM minutes
  CROSS JOIN choices
),

series AS (
  SELECT grid.minute, grid.comment, COALESCE(delta_by_minute.delta, 0) AS delta, COALESCE(initial.voteCountBefore, 0) AS initialVoteCount
  FROM grid
  LEFT JOIN delta_by_minute
  ON delta_by_minute.minute = grid.minute AND delta_by_minute.comment = grid.comment
  LEFT JOIN initial
  ON initial.comment = grid.comment
),

result AS (
  SELECT minute, comment, initialVoteCount + SUM(delta) OVER (
    PARTITION BY comment
    ORDER BY minute
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS voteCount
  FROM series
)

SELECT minute, comment, voteCount
FROM result
ORDER BY minute ASC, voteCount DESC, comment ASC;
`,
        { windowMinutes },
      );
    },
  );
};

export default routes;
