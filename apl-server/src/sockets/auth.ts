import { ElysiaWS } from "elysia/dist/ws";
import Toggl from "toggl-track";
import client from "../db/client";

/**
 * Converts a auth token to a toggl user ID.
 * @param token The token to use.
 * @returns The user ID and token or null if the token is invalid.
 */
export async function tokenToTogglData(token: string) {
  console.log(token);
  try {
    console.log("trying to convert token to toggl data" + token);
    const user = await client.user.findFirst({
      where: {
        tokens: {
          some: { token, type: "SESSION" },
        },
      },
      select: {
        id: true,
        config: {
          select: {
            togglToken: true,
            togglUserId: true,
          },
        },
      },
    });

    if (!user || !user.config) return null;

    return {
      userId: user.id,
      ...user.config,
    };
  } catch (e) {
    return null;
  }
}

const socketIDs = new Map<string, string>();

export function sockToID(socket: ElysiaWS) {
  return socketIDs.get(socket.id);
}

export function addSocket(id: string, socket: ElysiaWS) {
  socketIDs.set(socket.id, id);
}

export function removeSocket(socket: ElysiaWS) {
  socketIDs.delete(socket.id);
}
