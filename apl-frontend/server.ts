import {treaty} from "@elysiajs/eden";
import type {APLServer} from "../apl-server/src"

//@ts-ignore
const client = treaty<APLServer>("localhost:3000")

