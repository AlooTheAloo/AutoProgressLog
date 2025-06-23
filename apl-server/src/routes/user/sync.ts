import Elysia, { t } from "elysia";
import createWebhook from "../../integrations/toggl/createWebhook";

const t_createWebhookBodySchema = t.Object({
  lastSync: t.Number(),
  token: t.String(),
});
export const createWebhookRoute = new Elysia({ name: "Synchronize Data" }).post(
  "/sync",
  async ({ body, status }) => {
    // TODO : Generate Toggl data
    // TODO : Generate Anki data
    // TODO : Generate Report data
    // TODO : Return Data
  },
  {
    body: t_createWebhookBodySchema,
    detail: {
      summary: "Synchronize all new Data since the last sync",
      tags: ["Webhooks"],
      description:
        "This returns information necessary to update the application to the latest state.",
    },
  }
);
