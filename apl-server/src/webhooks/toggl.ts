export const togglWebhook = async (req: Request) => {
  console.log(req.body);
  return new Response("ok");
};
