#include "wmctrl.h"

Screen *get_screen(Display *disp, enum STATES *st) {
    if (!disp)
        disp = XOpenDisplay(NULL);

    if (!disp) {
        *st = CAN_NOT_OPEN_DISPLAY;
        return NULL;
    }

    Screen *sc = DefaultScreenOfDisplay(disp);
    *st = SCREEN_GET;

    return sc;
}

void free_screen(Screen *sc) {
    XCloseDisplay(sc->display);
}