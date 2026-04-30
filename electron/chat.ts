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
          startedAt: z.iso.datetime().nullable().default(null),
        }),
      },
    },
    async (request) => {
      const { startedAt } = request.query;
      return fastify.sqlite.all<Record<string, string>>(
        `
WITH RECURSIVE
base AS (
  SELECT id, userId, comment, receivedTime, strftime('%Y-%m-%dT%H:%M:00Z', receivedTime) AS minute
  FROM chat
  WHERE :startedAt IS NULL OR receivedTime >= :startedAt
),

-- 같은 유저가 같은 분 안에 여러 번 투표했다면,
-- 그 분의 마지막 투표만 인정
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

-- 유저별 이전 투표값 확인
changes AS (
  SELECT userId, minute, comment, LAG(comment) OVER (
    PARTITION BY userId
    ORDER BY minute
  ) AS prevComment
  FROM per_user_minute
),

-- 투표 변화량 계산
-- 첫 투표: 현재 comment +1
-- 투표 변경: 이전 comment -1, 현재 comment +1
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

bounds AS (
  SELECT MIN(unixepoch(minute)) AS startTs, MAX(unixepoch(minute)) AS endTs
  FROM base
),

-- 첫 투표 시각부터 마지막 투표 시각까지 1분 단위 생성
minutes(ts, minute) AS (
  SELECT startTs, strftime('%Y-%m-%dT%H:%M:00Z', startTs, 'unixepoch')
  FROM bounds
  WHERE startTs IS NOT NULL

  UNION ALL

  SELECT ts + 60, strftime('%Y-%m-%dT%H:%M:00Z', ts + 60, 'unixepoch')
  FROM minutes, bounds
  WHERE ts + 60 <= bounds.endTs
),

choices AS (
  SELECT DISTINCT comment
  FROM base
),

grid AS (
  SELECT minutes.minute, choices.comment
  FROM minutes
  CROSS JOIN choices
),

series AS (
  SELECT grid.minute, grid.comment, COALESCE(delta_by_minute.delta, 0) AS delta
  FROM grid
  LEFT JOIN delta_by_minute
  ON delta_by_minute.minute = grid.minute AND delta_by_minute.comment = grid.comment
),

result AS (
  SELECT minute, comment, SUM(delta) OVER (
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
        { startedAt },
      );
    },
  );
};

export default routes;
