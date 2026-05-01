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
          bucketMinutes: z.coerce.number().int().min(1).default(1),
        }),
      },
    },
    async (request) => {
      const { windowMinutes, bucketMinutes } = request.query;
      return fastify.sqlite.all<Record<string, string>>(
        `
WITH RECURSIVE
params AS (
  SELECT
    CASE
      WHEN CAST(:windowMinutes AS INTEGER) > 0 THEN CAST(:windowMinutes AS INTEGER)
      ELSE 10
    END AS windowMinutes,

    CASE
      WHEN CAST(:bucketMinutes AS INTEGER) > 0 THEN CAST(:bucketMinutes AS INTEGER)
      ELSE 5
    END AS bucketMinutes
),

settings AS (
  SELECT
    windowMinutes,
    bucketMinutes,
    bucketMinutes * 60 AS bucketSeconds,

    -- 최근 n분을 bucketMinutes 단위 개수로 환산
    -- 예: windowMinutes = 60, bucketMinutes = 5  → 12개
    -- 예: windowMinutes = 60, bucketMinutes = 10 → 6개
    CAST((windowMinutes + bucketMinutes - 1) / bucketMinutes AS INTEGER) AS bucketCount
  FROM params
),

base AS (
  SELECT
    id,
    userId,
    comment,
    receivedTime,

    CAST(unixepoch(receivedTime) / (SELECT bucketSeconds FROM settings) AS INTEGER)
      * (SELECT bucketSeconds FROM settings) AS bucketTs,

    strftime(
      '%Y-%m-%dT%H:%M:00Z',
      CAST(unixepoch(receivedTime) / (SELECT bucketSeconds FROM settings) AS INTEGER)
        * (SELECT bucketSeconds FROM settings),
      'unixepoch'
    ) AS bucketTime
  FROM chat
),

bounds AS (
  SELECT
    MAX(bucketTs) AS endTs,
    MAX(bucketTs) - ((SELECT bucketCount FROM settings) - 1) * (SELECT bucketSeconds FROM settings) AS startTs
  FROM base
),

ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY userId, bucketTs
      ORDER BY receivedTime DESC, id DESC
    ) AS rn
  FROM base
),

per_user_bucket AS (
  SELECT
    userId,
    bucketTs,
    bucketTime,
    comment
  FROM ranked
  WHERE rn = 1
),

changes AS (
  SELECT
    userId,
    bucketTs,
    bucketTime,
    comment,
    LAG(comment) OVER (
      PARTITION BY userId
      ORDER BY bucketTs
    ) AS prevComment
  FROM per_user_bucket
),

delta AS (
  SELECT
    bucketTs,
    bucketTime,
    comment,
    1 AS delta
  FROM changes
  WHERE prevComment IS NULL OR prevComment <> comment

  UNION ALL

  SELECT
    bucketTs,
    bucketTime,
    prevComment AS comment,
    -1 AS delta
  FROM changes
  WHERE prevComment IS NOT NULL AND prevComment <> comment
),

delta_by_bucket AS (
  SELECT
    bucketTs,
    comment,
    SUM(delta) AS delta
  FROM delta
  GROUP BY bucketTs, comment
),

initial AS (
  SELECT
    delta.comment,
    SUM(delta.delta) AS voteCountBefore
  FROM delta
  CROSS JOIN bounds
  WHERE delta.bucketTs < bounds.startTs
  GROUP BY delta.comment
),

buckets(ts, bucketTime) AS (
  SELECT
    startTs,
    strftime('%Y-%m-%dT%H:%M:00Z', startTs, 'unixepoch')
  FROM bounds
  WHERE startTs IS NOT NULL

  UNION ALL

  SELECT
    ts + (SELECT bucketSeconds FROM settings),
    strftime(
      '%Y-%m-%dT%H:%M:00Z',
      ts + (SELECT bucketSeconds FROM settings),
      'unixepoch'
    )
  FROM buckets, bounds
  WHERE ts + (SELECT bucketSeconds FROM settings) <= bounds.endTs
),

choices AS (
  SELECT comment
  FROM initial
  WHERE voteCountBefore <> 0

  UNION

  SELECT delta.comment
  FROM delta
  CROSS JOIN bounds
  WHERE delta.bucketTs BETWEEN bounds.startTs AND bounds.endTs
),

grid AS (
  SELECT
    buckets.ts AS bucketTs,
    buckets.bucketTime,
    choices.comment
  FROM buckets
  CROSS JOIN choices
),

series AS (
  SELECT
    grid.bucketTs,
    grid.bucketTime,
    grid.comment,
    COALESCE(delta_by_bucket.delta, 0) AS delta,
    COALESCE(initial.voteCountBefore, 0) AS initialVoteCount
  FROM grid
  LEFT JOIN delta_by_bucket
  ON delta_by_bucket.bucketTs = grid.bucketTs AND delta_by_bucket.comment = grid.comment
  LEFT JOIN initial
  ON initial.comment = grid.comment
),

result AS (
  SELECT
    bucketTime,
    comment,
    initialVoteCount + SUM(delta) OVER (
      PARTITION BY comment
      ORDER BY bucketTs
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS voteCount
  FROM series
)

SELECT
  bucketTime,
  comment,
  voteCount
FROM result
ORDER BY bucketTime ASC, voteCount DESC, comment ASC;
`,
        { windowMinutes, bucketMinutes },
      );
    },
  );
};

export default routes;
