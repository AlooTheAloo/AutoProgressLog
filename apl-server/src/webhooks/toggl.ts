import Elysia, { t } from "elysia";
import { SocketManager } from "../sockets/manager";
import { sockToID } from "../sockets/auth";
import client from "../db/client";

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
  validation_code: t.Optional(t.String()),
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

export type MiniActivity = {
  activity: string;
  start: string;
  id: number;
};

const current_Activities: Map<string, MiniActivity> = new Map<
  string,
  MiniActivity
>();

export const togglWebhook = new Elysia({ name: "toggl-webhook" }).post(
  "/webhooks/toggl",
  async ({ body, status }) => {
    if (body.payload === "ping") {
      return !body.validation_code
        ? status(200)
        : { validation_code: body.validation_code };
    } else {
      const { action, event_user_id, model, workspace_id } = body.metadata;
      const aplUsers = await client.userConfig.findMany({
        where: { togglUserId: event_user_id },
        select: { user: { select: { id: true } } },
      });
      const payload = body.payload;
      if (action === "created") {
        console.log("created activity", payload);
        if (payload.stop == undefined) {
          SocketManager.instance.send(event_user_id, "ActivityStart", {
            activity: payload.description || "(No Description)",
            start: payload.start,
            id: payload.id,
          });
          current_Activities.set(event_user_id, {
            activity: payload.description || "(No Description)",
            start: payload.start,
            id: payload.id,
          });
        }
      }

      if (action === "updated") {
        console.log("updated activity", payload);

        // If it's the currently running activity, stop it in the socket manager
        if (
          current_Activities.get(event_user_id)?.id == payload.id &&
          payload.stop != undefined
        ) {
          SocketManager.instance.send(event_user_id, "ActivityStop", {
            id: payload.id,
          });
          current_Activities.delete(event_user_id);
        }

        // Upsert the activity in the database if it has a stop time
        if (payload.stop != undefined && aplUsers.length > 0) {
          for (const config of aplUsers) {
            const aplUser = config.user;
            const activity = await client.immersionActivity.findFirst({
              where: {
                activityTogglId: payload.id.toString(),
                userId: aplUser.id,
              },
            });

            if (activity) {
              await client.immersionActivity.update({
                where: { id: activity.id },
                data: {
                  activityName: payload.description || "(No Description)",
                  seconds: payload.duration,
                },
              });
            } else {
              await client.immersionActivity.create({
                data: {
                  userId: aplUser.id,
                  activityName: payload.description || "(No Description)",
                  activityTogglId: payload.id.toString(),
                  createdAt: new Date(payload.start),
                  seconds: Math.floor(
                    (new Date(payload.stop).getTime() -
                      new Date(payload.start).getTime()) /
                      1000
                  ),
                },
              });
            }

            const totalImmersion = await client.immersionActivity.aggregate({
              where: { userId: aplUser.id },
              _sum: { seconds: true },
            });
            console.log(
              `total immersion for user ${aplUser.id}:`,
              totalImmersion
            );
          }
        }
      }

      if (action === "deleted") {
        try {
          console.log("deleted activity", payload);

          await client.immersionActivity.deleteMany({
            where: { activityTogglId: payload.id.toString() },
          });
          console.log(`Deleted activities with Toggl ID: ${payload.id}`);
        } catch (e) {
          console.log(
            `Failed to delete activity with Toggl ID: ${payload.id}. It might not exist.`
          );
        }
      }

      return new Response("ok");
    }
  },
  {
    body: togglWebhookBodySchema,
    detail: {
      summary: "Toggl Time Tracking Webhook",
      tags: ["Webhooks"],
      description: "Used by Toggl to send time tracking data",
    },
  }
);

export function initTogglNotifications() {
  SocketManager.instance.addAuthListener((ws) => {
    const id = sockToID(ws);
    if (id == undefined) return;
    if (current_Activities.has(id)) {
      SocketManager.instance.send(
        id,
        "ActivityStart",
        current_Activities.get(id)
      );
    } else {
      SocketManager.instance.send(id, "ClearActivity", {});
    }
  });
}
