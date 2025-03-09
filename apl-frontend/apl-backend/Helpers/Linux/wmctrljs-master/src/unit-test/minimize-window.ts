import { getWindowsByClassNameSync, windowMinimize, closeWindowById, closeWindowByIdSync } from '../index';
import { createXeyes, wait } from './utils';

export const run = (async () => {
    await createXeyes(2);
    const windows = await getWindowsByClassNameSync("xeyes.XEyes");
    if (windows.length < 1) {
        console.error("Can't create window xeyes");
        return;
    }

    const wid1 = windows[0].win_id;
    const wid2 = windows[1].win_id;

    await windowMinimize(wid1);
    await wait(1);
    await windowMinimize(wid2);
    closeWindowByIdSync(wid1);
    closeWindowById(wid2);
})();