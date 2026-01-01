import {Elysia} from "elysia";

export const rootRoute = new Elysia({name: 'root-route'})
    .get('/', () => {
        return {
            message: 'Welcome to the AutoProgressLog Storage API',
            version: '1.0.0',
            documentation: '/documentation'
        };
    });