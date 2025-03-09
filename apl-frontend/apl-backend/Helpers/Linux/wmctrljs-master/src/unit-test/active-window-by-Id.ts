import {
    activeWindowById,
    activeWindowByIdSync,
    getWindowsByClassName,
    closeWindowById
} from "../index";
import { createXeyes } from "./utils";

export const run = (async () => {
    try {
        console.log(activeWindowByIdSync(0));
    } catch(e) {
        console.log("[activeWindowByIdSync] Volountary error");
    }

    try {
        await activeWindowById(0);
    } catch(e) {
        console.log("[activeWindowById] Volountary error");
    }

    await createXeyes(1);
    const windows = await getWindowsByClassName("xeyes.XEyes");
    if (windows.length === 0) {
        console.error("Can't create xeyes windos");
        return;
    }

    const valid_win_id = windows[0].win_id;
    const nbrTest = 1000
    console.time(`[activeWindowByIdSync] duration for ${nbrTest}`);
    try {
        for (let i = 0; i < nbrTest; i++)
            activeWindowByIdSync(valid_win_id);
    } catch(e) {
        console.log("[activeWindowByIdSync] Volountary error");
    }
    console.timeEnd(`[activeWindowByIdSync] duration for ${nbrTest}`);

    console.time(`[activeWindowById] duration for ${nbrTest}`);
    try {
        const promises = [];
        for (let i = 0; i < nbrTest; i++)
            promises.push(activeWindowById(valid_win_id));
        await Promise.all(promises);
    } catch(e) {
        console.log("[activeWindowById] Volountary error");
    }
    console.timeEnd(`[activeWindowById] duration for ${nbrTest}`);
    closeWindowById(valid_win_id);
})();