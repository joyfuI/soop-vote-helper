import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { ChatResponse, SoopChat } from 'soop-extension';
import { SoopChatEvent, SoopClient } from 'soop-extension';

import { VOTE_COMMAND } from '../src/constant';

const soopChatMap = new Map<string, SoopChat>();

export const handleChat = (
  fastify: FastifyInstance,
  streamerId: string,
  response: ChatResponse,
) => {
  console.log(
    `[${response.receivedTime}] ${response.username}(${response.userId}): ${response.comment}`,
  );
  if (!fastify.workGate.isStarted()) {
    return;
  }
  if (response.comment.startsWith(`${VOTE_COMMAND} `)) {
    fastify.sqlite.run(
      `
INSERT INTO chat (streamerId, receivedTime, username, userId, comment)
VALUES (:streamerId, :receivedTime, :username, :userId, :comment);
`,
      {
        ...response,
        streamerId,
        userId: response.userId.replace(/\(\d\)$/, ''),
      },
    );
  }
};

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Params: { streamerId: string } }>(
    '/api/soop/:streamerId',
    async (request, reply) => {
      const { streamerId } = request.params;
      try {
        const client = new SoopClient();
        const soopChat = client.chat({ streamerId });
        soopChatMap.set(streamerId, soopChat);

        // 채팅 데이터
        soopChat.on(SoopChatEvent.CHAT, (response) =>
          handleChat(fastify, streamerId, response),
        );

        // 연결 종료
        soopChat.on(SoopChatEvent.DISCONNECT, (response) => {
          console.log(
            `[${response.receivedTime}] ${response.streamerId}'s stream has ended`,
          );
          // 연결이 끊기면 재연결
          soopChatMap.get(streamerId)?.connect();
        });

        // Connect to chat
        await soopChat.connect();
      } catch {
        console.log('error soopChat');
        soopChatMap.delete(streamerId);
        return reply.code(500).send({ message: 'error soopChat' });
      }
    },
  );

  fastify.delete<{ Params: { streamerId: string } }>(
    '/api/soop/:streamerId',
    async (request) => {
      const { streamerId } = request.params;
      const soopChat = soopChatMap.get(streamerId);
      soopChatMap.delete(streamerId);
      soopChat?.disconnect();
    },
  );
};

export default routes;
