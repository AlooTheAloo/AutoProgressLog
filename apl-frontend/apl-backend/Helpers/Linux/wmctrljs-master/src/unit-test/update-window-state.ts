import { 
    getWindowsByClassNameSync, 
    windowState, 
    windowStateSync, 
    closeWindowById
} from '../index';
import { createXeyes, wait } from './utils';

export const run = (async () => {
    await createXeyes(1);
    const windows = getWindowsByClassNameSync("xeyes.XEyes");
    if (windows.length === 0) {
        console.error("Can't create window xeyes");
        return;
    }
    const { win_id } = windows[0];
    await windowState(win_id, "add", "maximized_vert", "maximized_horz");
    await wait(5);
    windowStateSync(win_id, "remove", "maximized_vert", "maximized_horz");
    await wait(2);
    closeWindowById(win_id);
})();