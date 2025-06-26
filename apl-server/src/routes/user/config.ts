import {Elysia, t} from "elysia";
import client from "../../db/client";
import {authGuard, authHeaders} from "../../middlewares/authGuard";
import {__nullable__} from "../../../prisma/types/__nullable__";
import {UserConfigPlain} from "../../../prisma/types/UserConfig";

const PublicUserConfig = t.Omit(UserConfigPlain, ['id', 'userId']);

export const configRoutes = new Elysia({name: 'config-routes'}).use(authGuard)

    /**
     * Get the user's configuration.
     */
    .get('/config', async ({user}) => {
        return client.userConfig.findUnique({
            where: {userId: user.id},
            select: {
                togglToken: true,
                autoGenTime: true,
                createdAt: true,
                updatedAt: true,
            }
        });
    }, {
        headers: authHeaders,
        response: __nullable__(PublicUserConfig),
        detail: {
            summary: 'Get user configuration',
            tags: ['User'],
            description: 'Returns the user\'s configuration.',
        },
    })

    /**
     * Update the user's configuration.
     */
    .patch('/config', async ({body, user}) => {
        return client.userConfig.update({
            where: {userId: user.id},
            data: {
                togglToken: body.togglToken,
                autoGenTime: body.autoGenTime,
            },
            select: {
                togglToken: true,
                autoGenTime: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }, {
        headers: authHeaders,
        body: t.Omit(UserConfigPlain, ['id', 'userId', 'createdAt', 'updatedAt']),
        response: PublicUserConfig,
        detail: {
            summary: 'Update user configuration',
            tags: ['User'],
            description: 'Updates the user\'s configuration.',
        },
    })

    /**
     * Create a new user configuration.
     */
    .post('/config', async ({body, user}) => {
        return client.userConfig.create({
            data: {
                togglToken: body.togglToken,
                autoGenTime: body.autoGenTime,
                userId: user.id,
            },
            select: {
                togglToken: true,
                autoGenTime: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }, {
        headers: authHeaders,
        body: t.Omit(UserConfigPlain, ['id', 'userId', 'createdAt', 'updatedAt']),
        response: PublicUserConfig,
        detail: {
            summary: 'Create user configuration',
            tags: ['User'],
            description: 'Creates a new user configuration.',
        },
    })
