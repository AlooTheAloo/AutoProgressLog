import {
    getScreen,
    getScreenSync
} from '../index';

export const run = (async () => {
    console.time("[getScreenSync]");
    try {
        console.log(getScreenSync());
    }
    catch(e) {
        console.error("[getScreenSync] Unexpected error ", e);
    }
    console.timeEnd("[getScreenSync]");

    console.time("[getScreen]");
    try {
        console.log(await getScreen());
    } catch(e) {
        console.error("[getScreen] Unexpected error ", e);
    }
    console.timeEnd("[getScreen]");

    const nbr = 1000;
    console.time(`[getScreenSync] ${nbr} calls`);
    try {
        for (let i = 0; i < nbr; i++) {
            getScreenSync();
        }
    } catch(e) {
        console.error("[getScreenSync] Unexpected error ", e);
    }
    console.timeEnd(`[getScreenSync] ${nbr} calls`);

    console.time(`[getScreen] ${nbr} calls`);
    try {
        const promises = [];
        for (let i = 0; i < nbr; i++)
            promises.push(getScreen());

        await Promise.all(promises);
    } catch(e) {
        console.error("[getScreen] Unexpected error ", e);
    }
    console.timeEnd(`[getScreen] ${nbr} calls`);
})();