import {
    closeWindowsByClassName,
    closeWindowsByClassNameSync
} from "../index";

export const run = (async () => {
    try {
        closeWindowsByClassNameSync("");
    } catch(e) {
        console.log("[closeWindowsByClassNameSync] Volountary error");
    }

    try {
        await closeWindowsByClassName("");
    } catch(e) {
        console.log("[closeWindowsByClassName] Volountary error");
    }
})();