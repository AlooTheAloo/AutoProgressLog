import {Elysia, t} from "elysia";
import {mkdir, writeFile} from "fs/promises";
import path from 'path'

export const uploadRoute = new Elysia({name: 'upload-route'})
    .post('/upload/:userId', async ({params, body, set}) => {
        const {userId} = params;
        const file = body.file as File;
        const buffer = new Uint8Array(await file.arrayBuffer());

        const dirPath = path.resolve('./public', 'pictures');
        const filePath = path.join(dirPath, `${userId}.png`);

        await mkdir(dirPath, {recursive: true});
        await writeFile(filePath, buffer);
        set.status = 200;
        return {message: 'Picture uploaded successfully'};
    }, {
        body: t.Object({
            file: t.File()
        }),
        params: t.Object({
            userId: t.String({format: 'uuid'})
        }),
        response: t.Object({
            message: t.String()
        }),
        detail: {
            tags: ['Pictures'],
            summary: 'Upload a user picture',
            description: 'Uploads a picture for the specified user ID. The picture is saved as a PNG file in the public/pictures directory.',
            responses: {
                200: {
                    description: 'Picture uploaded successfully'
                },
                400: {
                    description: 'Invalid request'
                },
                500: {
                    description: 'Internal server error'
                }
            }
        }
    })