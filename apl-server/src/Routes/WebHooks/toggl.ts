import Elysia, { t } from "elysia";

const metadataPingSchema = t.Object({
  request_type: t.Literal("POST"),
  event_user_id: t.Number(),
});

const metadataEventSchema = t.Object({
  event_user_id: t.String(),
  action: t.Union([
    t.Literal("created"),
    t.Literal("updated"),
    t.Literal("deleted"),
  ]),
  entity_id: t.String(),
  model: t.String(),
  workspace_id: t.String(),
});

const timeEntryPayloadSchema = t.Object({
  at: t.String(),
  billable: t.Boolean(),
  description: t.String(),
  duration: t.Number(),
  duronly: t.Boolean(),
  id: t.Number(),
  project_id: t.Nullable(t.Number()),
  start: t.String(),
  stop: t.Nullable(t.String()),
  tag_ids: t.Array(t.Number()),
  tags: t.Nullable(t.Array(t.String())), // sometimes null, sometimes []
  task_id: t.Nullable(t.Number()),
  user_id: t.Number(),
  workspace_id: t.Number(),
});

const togglWebhookPingSchema = t.Object({
  event_id: t.Number(),
  created_at: t.String(),
  creator_id: t.Number(),
  metadata: metadataPingSchema,
  payload: t.Literal("ping"),
  subscription_id: t.Number(),
  timestamp: t.String(),
  url_callback: t.String(),
  validation_code: t.String(),
});

const togglWebhookEventSchema = t.Object({
  event_id: t.Number(),
  created_at: t.String(),
  creator_id: t.Number(),
  metadata: metadataEventSchema,
  payload: timeEntryPayloadSchema,
  subscription_id: t.Number(),
  timestamp: t.String(),
  url_callback: t.String(),
});

export const togglWebhookBodySchema = t.Union([
  togglWebhookPingSchema,
  togglWebhookEventSchema,
]);

export default new Elysia().post(
  "/webhooks/toggl",
  async ({ body }) => {
    console.log("Received something !");

    console.log(body);
    if (body.payload === "ping") {
      console.log("Received ping");
      return { validation_code: body.validation_code };
    } else {
      console.log(body.metadata.action);
      return new Response("ok");
    }
  },
  {
    body: togglWebhookBodySchema,
  }
);
