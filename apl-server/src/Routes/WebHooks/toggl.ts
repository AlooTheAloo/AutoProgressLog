import Elysia from "elysia";

export default new Elysia().post("/webhooks/toggl", async ({ set, body }) => {
  console.log("set " + set);
  console.log("body " + body);

  return 200;
});
