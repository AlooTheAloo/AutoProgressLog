import {
    getWindowsByPidSync,
    getWindowsByPid,
    getWindowsByClassName,
    closeWindowsByClassName
} from '../index';
import { createFirefox } from './utils';

export const run = (async () => {
    await createFirefox(3);

    const windows = await getWindowsByClassName("Navigator.Firefox");
    const pid = windows[0].win_pid;

    console.log(getWindowsByPidSync(pid));
    console.log(await getWindowsByPid(pid));

    const nbr = 1000;
    console.time("[getWindowsByPidSync]");
    try {
        for (let i = 0; i < nbr; i++) {
            getWindowsByPidSync(pid);
        }
    } catch(e) {
        console.error("[getWindowsByPidSync] Unexpected error", e);
    }
    console.timeEnd("[getWindowsByPidSync]");

    console.time("[getWindowsByPid]");
    try {
        const promises = [];
        for (let i = 0; i < nbr; i++)
            promises.push(getWindowsByPid(pid));

        await Promise.all(promises);
    } catch(e) {
        console.error("[getWindowsByPid] Unexpected error", e);
    }
    console.timeEnd("[getWindowsByPid]");
    closeWindowsByClassName("xeyes.XEyes");
})();