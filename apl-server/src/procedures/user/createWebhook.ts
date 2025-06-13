import Elysia, { t } from "elysia";
import createWebhook from "../../util/toggl/createWebhook";

const t_createWebhookBodySchema = t.Object({
  workspaceID: t.Number(),
  token: t.String(),
});
export const createWebhookRoute = new Elysia({ name: "create-webhook" }).post(
  "/webhooks/toggl",
  async ({ body, status }) => {
    // TODO : Convert session token to toggl Token
    createWebhook(body.workspaceID, body.token);
  },
  {
    body: t_createWebhookBodySchema,
    detail: {
      summary: "Initializes or enables the APL-Toggl webhook",
      tags: ["Webhooks"],
      description:
        "The webhook is used to send time tracking data to the APL server.",
    },
  }
);
