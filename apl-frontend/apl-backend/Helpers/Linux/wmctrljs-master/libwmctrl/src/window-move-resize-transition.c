#include "wmctrl.h"

struct pos_dims {
    int32_t x;
    int32_t y;
    int32_t w;
    int32_t h;
};

static int max(int tab[], size_t length) {
    int max = tab[0];
    for (size_t i = 1; i < length; i++) {
        if (max < tab[i])
            max = tab[i];
    }
    return max;
}

static size_t get_pos_dims_size(struct geometry *geo, int32_t x, int32_t y, 
    int32_t w, int32_t h, int pad) {

    int rx = geo->x > x ? geo->x -x : x - geo->x;
    int ry = geo->y > y ? geo->y - y : y - geo->x;
    int rw = geo->width > w ? geo->width - w : w - geo->width;
    int rh = geo->height > h ? geo->height - h : h - geo->height;

    rx /= pad;
    ry /= pad;
    rw /= pad;
    rh /= pad;

    int tab[] = {rx, ry, rw, rh};
    return max(tab, 4) + 1;
}

enum STATES window_move_resize_transition(Display *disp, Window win, int32_t grav, 
    int32_t x, int32_t y, 
    int32_t w, int32_t h, float await_time, int pad) {
    bool displayProvided = true;
    struct geometry *geo;
    struct pos_dims *pos_dims;
    size_t count_x = 0;
    size_t count_y = 0;
    size_t count_w = 0;
    size_t count_h = 0;
    size_t i = 0;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    if (grav < 0)
        return CAN_NOT_MOVE_RESIZE_WINDOW;

    geo = get_window_geometry(disp, win);
    pos_dims = malloc(sizeof(struct pos_dims) * get_pos_dims_size(geo, x, y, w, h, pad));
    if (!geo || !pos_dims)
        return CAN_NOT_ALLOCATE_MEMORY;

    if (geo->x == x) {
        pos_dims[i].x = x;
        i++;
    }
    else if (geo->x > x) {
        int tmp_x = geo->x;
        while (tmp_x > x) {
            tmp_x -= pad;
            pos_dims[i].x = tmp_x > x ? tmp_x : x;
            i++;
        }
    } else {
        int tmp_x = geo->x;
        while (tmp_x < x) {
            tmp_x += pad;
            pos_dims[i].x = tmp_x < x ? tmp_x : x;
            i++;
        }
    }
    count_x = i;

    i = 0;
    if (geo->y == y) {
        pos_dims[i].y = y;
        i++;
    }
    else if (geo->y > y) {
        int tmp_y = geo->y;
        while (tmp_y > y) {
            tmp_y -= pad;
            pos_dims[i].y = tmp_y > y ? tmp_y : y;
            i++;
        }
    }else {
        int tmp_y = geo->y;
        while (tmp_y <= x) {
            tmp_y += pad;
            pos_dims[i].y = tmp_y <= x ? tmp_y : y;
            i++;
        }
    }
    count_y = i;

    i = 0;
    if (geo->width == w) {
        pos_dims[i].w = w;
        i++;
    }
    else if (geo->width > w) {
        int tmp_width = geo->width;
        while (tmp_width > w) {
            tmp_width -= pad;
            pos_dims[i].w = tmp_width > w ? tmp_width : w;
            i++;
        }
    } else {
        int tmp_width = geo->width;
        while (tmp_width <= w) {
            tmp_width += pad;
            pos_dims[i].w = tmp_width <= w ? tmp_width : w;
            i++;
        }
    }
    count_w = i;

    i = 0;
    if (geo->height == h) {
        pos_dims[i].h = h;
        i++;
    }
    else if (geo->height > h) {
        int tmp_height = geo->height;
        while (tmp_height > h) {
            tmp_height -= pad;
            pos_dims[i].h = tmp_height > h ? tmp_height : h;
            i++;
        }
    }else {
        int tmp_height = geo->height;
        while (tmp_height <= h) {
            tmp_height += pad;
            pos_dims[i].h = tmp_height <= h ? tmp_height :h;
            i++;
        }
    }
    count_h = i;

    i = 0;
    while(i < count_x || i < count_y || i < count_w || i < count_h) {
        int rx,ry,rw,rh;
        rx = i >= count_x ? x : pos_dims[i].x;
        ry = i >= count_y ? y : pos_dims[i].y;
        rw = i >= count_w ? w : pos_dims[i].w;
        rh = i >= count_h ? h : pos_dims[i].h;

        int time = await_time * 1000;
        window_move_resize(disp, win, grav, rx, ry, rw, rh);
        XSync(disp, True);
        usleep(time);
        i++;
    }

    free(geo);
    free(pos_dims);
    if (!displayProvided)
        XCloseDisplay(disp);

    return WINDOW_MOVED_RESIZED;
}