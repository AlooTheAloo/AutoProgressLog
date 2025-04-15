import { Elysia } from "elysia";
import { initDB } from "./Database";
import SurveyAnswer from "./Routes/SurveyAnswer";
import HelloWorld from "./Routes/HelloWorld";
import Downloads from "./Routes/Downloads";
import cors from "@elysiajs/cors";

initDB();

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:5174", "https://aplapp.dev"],
    })
  )
  .use(HelloWorld)
  .use(SurveyAnswer)
  .use(Downloads);

app.listen(3000);

console.log("️‍🔥️ Server is running at http://localhost:3000/");
