import {
    closeWindowsByPid,
    closeWindowsByPidSync
} from "../index";

export const run = (async () => {
    try {
        closeWindowsByPidSync(0);
    } catch(e) {
        console.log("[closeWindowsByPidSync] Volountary error");
    }

    try {
        await closeWindowsByPid(0);
    } catch(e) {
        console.log("[closeWindowsByPid] Volountary error");
    }
})();