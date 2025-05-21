import { Elysia } from "elysia";
import HelloWorld from "./Routes/HelloWorld";
import Downloads from "./Routes/Downloads";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:*", "https://www.aplapp.dev"],
    })
  )
  .use(HelloWorld)
  .use(Downloads);

app.listen(3000);

console.log("️‍🔥️ Server is running at http://localhost:3000/");
