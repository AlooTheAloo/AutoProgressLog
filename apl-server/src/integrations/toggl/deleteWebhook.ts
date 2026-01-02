import { Toggl } from "toggl-track";
import { TogglWebhookClient } from "toggl-webhook";

export default async function deleteWebhook(
  workspaceID: number = -1,
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

  const wh = ls.find((x) => x.description == "APL_Toggl_Webhook");
  if (wh == undefined) return;

  await client.deleteSubscription({
    subscription_id: wh.subscription_id,
    workspace_id: wh.workspace_id,
  });
}
