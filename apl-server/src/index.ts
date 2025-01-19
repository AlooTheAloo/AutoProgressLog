import { Elysia } from "elysia";
import { initDB } from "./Database";
import SurveyAnswer from "./Routes/SurveyAnswer";
import HelloWorld from "./Routes/HelloWorld";

initDB();

const app = new Elysia()
    .use(HelloWorld)
    .use(SurveyAnswer)

app.listen(3000); 

console.log("️‍🔥️ Server is running at http://localhost:3000/");



