import { 
    getWindowsByClassName, 
    windowAllowAllSizes, 
    windowAllowAllSizesSync, 
    windowMoveResize, 
    windowMoveResizeSync, 
    closeWindowById, 
    closeWindowByIdSync, 
    getScreen
} from '../index';
import { createFirefox, wait } from './utils';

export const run = (async () => {
    await createFirefox(2);
    await wait(5);
    const screen = await getScreen();
    const windows = await getWindowsByClassName("Navigator.Firefox");
    if (windows.length < 1) {
        console.error("Can't create firefox window");
        return;
    }

    const wid1 = windows[0].win_id;
    const wid2 = windows[1].win_id;
    await windowAllowAllSizes(wid1);
    windowAllowAllSizesSync(wid2);

    await windowMoveResize(wid1, 0, 0, 0, 50, 50);
    await wait(1);
    windowMoveResizeSync(wid2, 0, screen.width -50, 0, 50, 50);
    await wait(3);
    closeWindowById(wid1);
    closeWindowByIdSync(wid2);
})();