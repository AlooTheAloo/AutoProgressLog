import {loginProcedure} from "./auth/loginProcedure";
import {authenticateProcedure} from "./auth/validateProcedure";
import {Elysia} from "elysia";

export const authProcedure = new Elysia({name: 'auth-routes'}).use(loginProcedure).use(authenticateProcedure)