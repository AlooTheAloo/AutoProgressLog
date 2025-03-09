import {
    activeWindowsByClassName,
    activeWindowsByClassNameSync,
    closeWindowsByClassName,
    getWindowsByClassName
} from "../index";
import { createXeyes, wait } from "./utils";

export const run = (async () => {
    try {
        activeWindowsByClassNameSync("");
    } catch(e) {
        console.log("[activeWindowsByClassNameSync] Volountary error");
    }

    try {
        await activeWindowsByClassName("");
    } catch(e) {
        console.log("[activeWindowsByClassName] Volountary error");
    }

    await createXeyes(5);
    await wait(5);
    const windows = await getWindowsByClassName("xeyes.XEyes");
    if (windows.length === 0) {
        console.error("Can't create xeyes windows");
        return;
    }

    const valid_win_class_name = "xeyes.XEyes";
    const nbrTest = 10;
    console.time(`[activeWindowsByClassNameSync] duration for ${nbrTest}`);
    try {
        for (let i = 0; i < nbrTest; i++)
            activeWindowsByClassNameSync(valid_win_class_name);
    } catch(e) {
        console.log("[activeWindowsByClassNameSync] Unexpected error", e);
    }
    console.timeEnd(`[activeWindowsByClassNameSync] duration for ${nbrTest}`);

    console.time(`[activeWindowsByClassName] duration for ${nbrTest}`);
    try {
        const promises = [];
        for (let i = 0; i < nbrTest; i++)
            promises.push(activeWindowsByClassName(valid_win_class_name));
        await Promise.all(promises);
    } catch(e) {
        console.log("[activeWindowsByClassName] Unexpected error", e);
    }
    console.timeEnd(`[activeWindowsByClassName] duration for ${nbrTest}`);
    closeWindowsByClassName(valid_win_class_name);
})();