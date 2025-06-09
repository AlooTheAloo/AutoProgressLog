import { ElysiaWS } from "elysia/dist/ws";
import Toggl from "toggl-track";

export async function auth(token: string) {
  try {
    const tog = new Toggl({
      auth: {
        token: token,
      },
    });
    const me = await tog.me.get();
    return (me.id as number).toString();
  } catch (e) {
    return false;
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
