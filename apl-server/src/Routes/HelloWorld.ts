import { t, Elysia, Static } from "elysia";
import { InsertSurvey } from "../Database/Survey/Survey";
export default new Elysia()
	.get('/', ({ set }) => {
        return "Hello World! The APL server is running 🔥️"
    })