import {
    closeWindowById,
    closeWindowByIdSync,
    getWindowsByClassName
} from "../index";
import { createXeyes, wait } from "./utils";

export const run = (async () => {
    try {
        console.log(closeWindowByIdSync(0));
    } catch(e) {
        console.log("[closeWindowByIdSync] Volountary error");
    }

    try {
        await closeWindowById(0)
    } catch(e) {
        console.log("[closeWindowById] Volountary error");
    }

    await createXeyes(20);
    await wait(5);
    const windows = await getWindowsByClassName("xeyes.XEyes");
    if (windows.length === 0) {
        console.error("Can't create xeyes windows");
        return;
    }

    console.time("[closeWindowByIdSync]");
    try {
        for (let i = 0; i < 10; i++)
            closeWindowByIdSync(windows[i].win_id);
    } catch(e) {
        console.error("[closeWindowByIdSync] Unexpected error", e);
    }
    console.timeEnd("[closeWindowByIdSync]");

    console.time("[closeWindowById]");
    try {
        const promises = [];
        for (let i = 10; i < 20; i++)
            promises.push(closeWindowById(windows[i].win_id));
        await Promise.all(promises);
    } catch(e) {
        console.error("[closeWindowById] Unexpected error", e);
    }
    console.timeEnd("[closeWindowById]");
})();