import {
    windowMoveResizeTransition,
    getWindowsByClassName,
    closeWindowsByClassName
} from '../index';
import { createXeyes, wait } from './utils';

export const run = (async () => {
    await createXeyes(5);
    await wait(1);
    const windows = await getWindowsByClassName("xeyes.XEyes");

    await Promise.all([
        windowMoveResizeTransition(windows[0].win_id, 0, 500, 400, 100, 100, 20, 20),
        windowMoveResizeTransition(windows[1].win_id, 0, 150, 150, 100, 100, 20, 20),
        windowMoveResizeTransition(windows[2].win_id, 0, 200, 200, 200, 200, 20, 20),
        windowMoveResizeTransition(windows[3].win_id, 0, 300, 200, 400, 400, 20, 20),
        windowMoveResizeTransition(windows[4].win_id, 0, 400, 400, 400, 400, 20, 20),
        windowMoveResizeTransition(windows[0].win_id, 0, 250, 250, 300, 300, 20, 20),
        windowMoveResizeTransition(windows[1].win_id, 0, 300, 300, 400, 400, 20, 20),
        windowMoveResizeTransition(windows[2].win_id, 0, 350, 350, 500, 500, 20, 20),
        windowMoveResizeTransition(windows[3].win_id, 0, 500, 500, 500, 500, 20, 20),
        windowMoveResizeTransition(windows[4].win_id, 0, 600, 600, 500, 500, 20, 20),
        wait(2)
    ]);
    closeWindowsByClassName("xeyes.XEyes");
})();