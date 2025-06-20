import Toggl from "toggl-track";
import { EventAction, TogglWebhookClient } from "toggl-webhook";

const wh_name = "APL_Toggl_Webhook";

const wh_link =
  (process.env.url ?? "https://apl.chromaserver.net") + "/webhooks/toggl";
const evt_props = {
  event_filters: [{ entity: "time_entry", action: "*" as EventAction }],
  description: wh_name,
  secret: crypto.randomUUID().toString(),
  enabled: true,
};

/**
 * Initializes or enables the APL webhook. Consumes 2 tokens.
 * @param workspaceID The workspace ID to use. If -1, uses the default workspace and consumes 1 extra token.
 */
export default async function createWebhook(
  workspaceID = -1,
  togglToken: string
) {
  if (!togglToken) return;
  const toggl = new Toggl({
    auth: {
      token: togglToken,
    },
  });

  if (workspaceID == -1) {
    const me = await toggl.me.get();
    workspaceID = me.default_workspace_id;
  }

  const client = new TogglWebhookClient({
    apiToken: togglToken,
  });

  const ls = await client.listSubscriptions({
    workspace_id: workspaceID,
  });

  const wh = ls.find((x) => x.description == wh_name);
  if (wh != undefined) {
    client.updateSubscription({
      subscription_id: wh.subscription_id,
      workspace_id: wh.workspace_id,
      url_callback: wh_link,
      ...evt_props,
    });
    return;
  }

  await client.createSubscription({
    workspace_id: workspaceID,
    url_callback: wh_link,
    ...evt_props,
  });
}
