import { Elysia } from "elysia";
import { initDB } from "./Database";
import SurveyAnswer from "./Routes/SurveyAnswer";
import HelloWorld from "./Routes/HelloWorld";
import Downloads from "./Routes/Downloads";
import cors from "@elysiajs/cors";
import toggl from "./Routes/WebHooks/toggl";

initDB();

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:*", "https://www.aplapp.dev"],
    })
  )
  .use(HelloWorld)
  .use(SurveyAnswer)
  .use(Downloads)
  .use(toggl)
  .onError(({ code, error }) => {
    console.log(code);
    console.log(error);
    return 1;
  });

app.listen(3000);

console.log("️‍🔥️ Server is running at http://localhost:3000/");
