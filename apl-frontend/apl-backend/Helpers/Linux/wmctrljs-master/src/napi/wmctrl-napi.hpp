#include <napi.h>
extern "C" {
    #include "../../libwmctrl/src/wmctrl.h"
}

using namespace Napi;

char *get_libwmctrl_error(const char *fnName, enum STATES st);
void handling_libwmctrl_error(Env env, const char *fnName, enum STATES st);

//Utils
void checkId(const CallbackInfo &info, const char * fnName);
void checkClassName(const CallbackInfo &info, const char *fnName);
void checkPid(const CallbackInfo &info, const char *fnName);
void checkNumber(const CallbackInfo &info, const char *fnName, const char*field, unsigned i);

//Active
Boolean activeWindowByIdSync(const CallbackInfo &info);
Promise activeWindowByIdAsync(const CallbackInfo &info);

Boolean activeWindowsByPidSync(const CallbackInfo &info);
Promise activeWindowsByPidAsync(const CallbackInfo &info);

Boolean activeWindowsByClassNameSync(const CallbackInfo &info);
Promise activeWindowsByClassNameAsync(const CallbackInfo &info);

//Close
Boolean closeWindowByIdSync(const CallbackInfo &info);
Promise closeWindowByIdAsync(const CallbackInfo &info);

Boolean closeWindowsByPidSync(const CallbackInfo &info);
Promise closeWindowsByPidAsync(const CallbackInfo &info);

Boolean closeWindowsByClassNameSync(const CallbackInfo &info);
Promise closeWindowsByClassNameAsync(const CallbackInfo &info);

//Get Windows
Object create_window_js(Env env, struct window_info *wi);
Promise getWindowByIdAsync(const CallbackInfo &info);
Value getWindowByIdSync(const CallbackInfo &info);

Value getActiveWindowSync(const CallbackInfo &info);
Promise getActiveWindowAsync(const CallbackInfo &info);

Value getWindowListSync(const CallbackInfo &info);
Promise getWindowListAsync(const CallbackInfo &info);

Value getWindowsByClassNameSync(const CallbackInfo &info);
Promise getWindowsByClassNameAsync(const CallbackInfo &info);

Value getWindowsByPidSync(const CallbackInfo &info);
Promise getWindowsByPidAsync(const CallbackInfo &info);

//Screen
Value getScreenSync(const CallbackInfo &info);
Promise getScreenAsync(const CallbackInfo &info);

//Move-Resize
Boolean windowMoveResizeSync(const CallbackInfo &info);
Promise windowMoveResizeAsync(const CallbackInfo &info);

Promise windowMoveResizeTransitionAsync(const CallbackInfo &info);

Promise windowStateAsync(const CallbackInfo &info);
Boolean windowStateSync(const CallbackInfo &info);

//Minimize
Boolean windowMinimizeSync(const CallbackInfo &info);
Promise windowMinimizeAsync(const CallbackInfo &info);

//Allow-All-Sizes
Boolean windowAllowAllSizesSync(const CallbackInfo &info);
Promise windowAllowAllSizesAsync(const CallbackInfo &info);

//Raise
Boolean windowRaiseSync(const CallbackInfo &info);
Promise windowRaiseAsync(const CallbackInfo &info);