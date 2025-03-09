import { 
    getWindowsByClassName, 
    windowRaiseSync,
    windowRaise,
    closeWindowsByClassName
} from '../index';
import { createFirefox, wait } from './utils';

export const run = (async () => {
    await createFirefox(2);
    await wait(5);
    const windows = await getWindowsByClassName("Navigator.Firefox");
    if (windows.length < 1) {
        console.error("Can't create firefox window");
        return;
    }

    const wid1 = windows[0].win_id;
    const wid2 = windows[1].win_id;
    await windowRaise(wid1);
    await wait(1);
    windowRaiseSync(wid2);
    await wait(1);
    closeWindowsByClassName("Navigator.Firefox");
})();