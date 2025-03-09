import {
    windowMoveResizeSync,
    windowMoveResize,
    getWindowsByClassName,
    closeWindowsByClassName
} from '../index';
import { createXeyes, wait } from './utils';

export const run = (async () => {
    await createXeyes(3);
    await wait(3);
    const windows = await getWindowsByClassName("xeyes.XEyes");

    await windowMoveResize(windows[0].win_id, 0, 100, 100, 50, 50);
    await windowMoveResize(windows[1].win_id, 0, 150, 150, 100, 100);
    await windowMoveResize(windows[2].win_id, 0, 200, 200, 200, 200);
    await wait(3);
    windowMoveResizeSync(windows[0].win_id, 0, 250, 250, 300, 300);
    windowMoveResizeSync(windows[1].win_id, 0, 300, 300, 400, 400);
    windowMoveResizeSync(windows[2].win_id, 0, 350, 350, 500, 500);
    await wait(3);
    closeWindowsByClassName("xeyes.XEyes");
})();