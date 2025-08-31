import Toggl from "toggl-track";
import { EventAction, TogglWebhookClient } from "toggl-webhook";

const wh_name = "APL_Toggl_Webhook";
let wh_link =
  (process.env.url ?? "https://apl.chromaserver.net") + "/webhooks/toggl";

export function getWebhookLink() {
  return wh_link;
}

export function setWebhookLink(link: string) {
  wh_link = link;
}

const evt_props = {
  event_filters: [{ entity: "time_entry", action: "*" as EventAction }],
  description: wh_name,
  secret: crypto.randomUUID().toString(),
  enabled: true,
};

/**
 * Initializes or enables the APL webhook. Consumes 2 tokens.
 * @param workspaceID The workspace ID to use. If -1, uses the default workspace and consumes 1 extra token.
 * @param togglToken
 */
export default async function createWebhook(
  workspaceID = -1,
  togglToken: string
): Promise<{ uid: number; workspaceID: number } | undefined> {
  if (!togglToken) return;
  const toggl = new Toggl({
    auth: {
      token: togglToken,
    },
  });

  let uid;
  if (workspaceID == -1) {
    const me = await toggl.me.get();
    console.log("me is " + JSON.stringify(me));
    uid = me.id;
    workspaceID = me.default_workspace_id;
  }
  console.log("Creating webhook for workspace " + workspaceID);

  const client = new TogglWebhookClient({
    apiToken: togglToken,
  });

  const ls = await client.listSubscriptions({
    workspace_id: workspaceID,
  });

  const wh = ls.find((x) => x.description == wh_name);
  if (wh != undefined) {
    console.log("Updating webhook ! setting callback to " + wh_link);
    await client.updateSubscription({
      subscription_id: wh.subscription_id,
      workspace_id: wh.workspace_id,
      url_callback: wh_link,
      ...evt_props,
    });
    console.log("updated subscription!!! " + workspaceID);
    return { uid, workspaceID };
  }
  await client.createSubscription({
    workspace_id: workspaceID,
    url_callback: wh_link,
    ...evt_props,
  });
  console.log("webhook created successfully");
  return { uid, workspaceID };
}
