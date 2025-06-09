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
    console.log("Me is " + me.id);
    return (me.id as string).toString();
  } catch (e) {
    return false;
  }
}

const socketIDs = new Map<string, string>();

export function sockToID(socket: ElysiaWS) {
  console.log("Socket ids " + socketIDs.size);
  return socketIDs.get(socket.id);
}

export function addSocket(id: string, socket: ElysiaWS) {
  console.log("Adding socket " + socket.id + " to " + id);
  socketIDs.set(socket.id, id);
  console.log("Socket ids " + socketIDs.size);
}

export function removeSocket(socket: ElysiaWS) {
  socketIDs.delete(socket.id);
  console.log("Socket ids " + socketIDs.size);
}
