#include "wmctrl-napi.hpp"
#include <stdio.h>

using namespace Napi;

Object Init(Env env, Object exports) {
    init_wmctrl_lib();

    exports.Set("getScreenSync", Function::New(env, getScreenSync));
    exports.Set("getScreenAsync", Function::New(env, getScreenAsync));

    exports.Set("getWindowByIdAsync", Function::New(env, getWindowByIdAsync));
    exports.Set("getWindowByIdSync", Function::New(env, getWindowByIdSync));

    exports.Set("getActiveWindowSync", Function::New(env, getActiveWindowSync));
    exports.Set("getActiveWindowAsync", Function::New(env, getActiveWindowAsync));

    exports.Set("getWindowListSync", Function::New(env, getWindowListSync));
    exports.Set("getWindowListAsync", Function::New(env, getWindowListAsync));

    exports.Set("getWindowsByClassNameSync", Function::New(env, getWindowsByClassNameSync));
    exports.Set("getWindowsByClassNameAsync", Function::New(env, getWindowsByClassNameAsync));

    exports.Set("getWindowsByPidSync", Function::New(env, getWindowsByPidSync));
    exports.Set("getWindowsByPidAsync", Function::New(env, getWindowsByPidAsync));

    exports.Set("activeWindowByIdSync", Function::New(env, activeWindowByIdSync));
    exports.Set("activeWindowByIdAsync", Function::New(env, activeWindowByIdAsync));
    exports.Set("activeWindowsByPidSync", Function::New(env, activeWindowsByPidSync));
    exports.Set("activeWindowsByPidAsync", Function::New(env, activeWindowsByPidAsync));
    exports.Set("activeWindowsByClassNameSync", Function::New(env, activeWindowsByClassNameSync));
    exports.Set("activeWindowsByClassNameAsync", Function::New(env, activeWindowsByClassNameAsync));

    exports.Set("closeWindowByIdSync", Function::New(env, closeWindowByIdSync));
    exports.Set("closeWindowByIdAsync", Function::New(env, closeWindowByIdAsync));
    exports.Set("closeWindowsByPidSync", Function::New(env, closeWindowsByPidSync));
    exports.Set("closeWindowsByPidAsync", Function::New(env, closeWindowsByPidAsync));
    exports.Set("closeWindowsByClassNameSync", Function::New(env, closeWindowsByClassNameSync));
    exports.Set("closeWindowsByClassNameAsync", Function::New(env, closeWindowsByClassNameAsync));

    exports.Set("windowMoveResizeSync", Function::New(env, windowMoveResizeSync));
    exports.Set("windowMoveResizeAsync", Function::New(env, windowMoveResizeAsync));

    exports.Set("windowMoveResizeTransitionAsync", Function::New(env, windowMoveResizeTransitionAsync));

    exports.Set("windowStateSync", Function::New(env, windowStateSync));
    exports.Set("windowStateAsync", Function::New(env, windowStateAsync));

    exports.Set("windowMinimizeSync", Function::New(env, windowMinimizeSync));
    exports.Set("windowMinimizeAsync", Function::New(env, windowMinimizeAsync));

    exports.Set("windowAllowAllSizesSync", Function::New(env, windowAllowAllSizesSync));
    exports.Set("windowAllowAllSizesAsync", Function::New(env, windowAllowAllSizesAsync));

    exports.Set("windowRaiseSync", Function::New(env, windowRaiseSync));
    exports.Set("windowRaiseAsync", Function::New(env, windowRaiseAsync));
    return exports;
}

NODE_API_MODULE(wmctrl, Init)