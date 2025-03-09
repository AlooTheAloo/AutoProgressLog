import {
    getActiveWindowSync,
    getActiveWindow
} from '../index';

export const run = (async () => {
    console.time(`[getActiveWindowSync] duration`);
    try {
        console.log(getActiveWindowSync());
    } catch(e) {
        console.error(e);
    }
    console.timeEnd(`[getActiveWindowSync] duration`);

    console.time(`[getActiveWindowAsync] duration`);
    try {
        console.log(await getActiveWindow());
    } catch(e) {
        console.error(e);
    }
    console.timeEnd(`[getActiveWindowAsync] duration`);

    const nbr = 1000;
    console.time(`[getActiveWindowSync] for ${nbr} calls`);
    try {
        for (let i = 0; i < nbr; i++)
            getActiveWindowSync();
    } catch(e) {
        console.error(e);
    }
    console.timeEnd(`[getActiveWindowSync] for ${nbr} calls`);

    console.time(`[getActiveWindowAsync] for ${nbr} calls`);
    try {
        const promises = [];
        for (let i = 0; i < nbr; i++)
            promises.push(getActiveWindow());
        await Promise.all(promises);
    } catch(e) {
        console.error(e);
    }
    console.timeEnd(`[getActiveWindowAsync] for ${nbr} calls`);
})();