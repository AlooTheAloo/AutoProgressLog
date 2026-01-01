import ngrok from "@ngrok/ngrok";
import { setWebhookLink } from "../../integrations/toggl/createWebhook";
import { fullSyncTogglData } from "../toggl/syncService";

export async function startTunnel(port = 3000) {
  if (!Bun.env.NODE_ENV || Bun.env.NODE_ENV !== "development") {
    console.warn("Ngrok tunnel is only started in development mode.");
    return;
  }
  try {
    const listener = await ngrok.connect({
      addr: port,
      authtoken: Bun.env.NGROK_AUTH_TOKEN,
      region: "us", // Change region if needed
    });
    console.log(`Ngrok tunnel started at: ${listener.url()}`);
    fullSyncTogglData(4);
    setWebhookLink(listener.url() + "/webhooks/toggl");
    return listener;
  } catch (error) {
    console.error("Failed to start Ngrok tunnel:", error);
  }
}
