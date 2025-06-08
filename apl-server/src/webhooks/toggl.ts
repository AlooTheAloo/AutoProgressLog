import Elysia, { t } from "elysia";

export const togglWebhook = new Elysia({ name: 'toggl-webhook' })
    .post(
        "/webhooks/toggl",
        async ({ body, set }) => {
          console.log("Received webhook body:", body);
          set.status = 200;
          return "OK";
        },
        {
          body: t.Any(),
          detail: {
            tags: ["Webhooks"],
            description: "Receives time tracking event data from Toggl webhooks.",
          },
        }
    );
