#include "wmctrl.h"

struct window_info *get_active_window(Display *disp, enum STATES *st) {
    char *prop;
    unsigned long size;
    Window ret = (Window)0;
    bool displayProvided = true;
    struct window_info *wi = NULL;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp) {
        *st = CAN_NOT_OPEN_DISPLAY;
        return NULL;
    }

    prop = get_property(disp, DefaultRootWindow(disp), XA_WINDOW, 
                        "_NET_ACTIVE_WINDOW", &size);

    if (prop) {
        ret = *((Window*)prop);
        if (ret) {
            wi = create_window_info(disp, ret, NULL);
            if (!wi)
                *st = CAN_NOT_ALLOCATE_MEMORY;
            *st = CLIENT_LIST_GET;
        }
        else
            *st = NO_WINDOW_ACTIVE_FOR_NOW;

        free(prop);
    }
    else {
        *st = CAN_NOT_ACTIVATE_WINDOW;
    }

    if (!displayProvided)
        XCloseDisplay(disp);
    return wi;
}