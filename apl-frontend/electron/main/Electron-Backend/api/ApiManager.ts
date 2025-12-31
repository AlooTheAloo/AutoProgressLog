import { treaty } from "@elysiajs/eden";
import type { APLServer } from "../../../../../apl-server/src"; // Wow it just works

export let SERVER_URL: string | undefined = "";

// @ts-ignore
export let EdenClient = treaty<APLServer>(""); // This is so stupid

export async function initializeApiManager() {
  SERVER_URL = process.env.SERVER_URL;
  if (!SERVER_URL) throw new Error("SERVER_URL is not defined");
  console.log("Initializing API Manager with URL: " + SERVER_URL);
  // @ts-ignore
  EdenClient = treaty<APLServer>(SERVER_URL);
}
