const wmctrl = require("../dist/index.js");
const {wait} = require("../dist/unit-test/utils.js");

(async () => {
    const promises = [];
    for (let i = 0; i < 500; i++)
        promises.push(wmctrl.getWindowById(0x02800001));

    await Promise.all(promises);
    console.log(await wmctrl.getWindowById(0x02800001));

    const windows = await wmctrl.getWindowsByClassName("Navigator.Firefox");
    for (const win of windows) {
        await wmctrl.activeWindowById(win.win_id);
    }
    console.log("Wait 5 second");
    await wait(5);
})()
