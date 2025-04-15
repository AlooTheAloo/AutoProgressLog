import { Elysia } from "elysia";
import { initDB } from "./Database";
import SurveyAnswer from "./Routes/SurveyAnswer";
import HelloWorld from "./Routes/HelloWorld";
import Downloads from "./Routes/Downloads";

initDB();

const app = new Elysia().use(HelloWorld).use(SurveyAnswer).use(Downloads);

app.listen(3000);

console.log("️‍🔥️ Server is running at http://localhost:3000/");
