import {
    getWindowsByClassNameSync,
    getWindowsByClassName,
    closeWindowsByClassName
} from '../index';
import { createXeyes, wait } from './utils';

export const run = (async () => {
    await createXeyes(3);

    await wait(5);
    const windows = await getWindowsByClassName("xeyes.XEyes");
    console.log(windows);

    const class_name = windows[0].win_class;
    const nbr = 1000;
    console.time("[getWindowsByClassNameSync]");
    try {
        for (let i = 0; i < nbr; i++) {
            getWindowsByClassNameSync(class_name);
        }
    } catch(e) {
        console.error("[getWindowsByClassNameSync] Unexpected error", e);
    }
    console.timeEnd("[getWindowsByClassNameSync]");

    console.time("[getWindowsByClassName]");
    try {
        const promises = [];
        for (let i = 0; i < nbr; i++)
            promises.push(getWindowsByClassName(class_name));

        await Promise.all(promises);
    } catch(e) {
        console.error("[getWindowsByClassName] Unexpected error", e);
    }
    console.timeEnd("[getWindowsByClassName]");
    closeWindowsByClassName(class_name);
})();