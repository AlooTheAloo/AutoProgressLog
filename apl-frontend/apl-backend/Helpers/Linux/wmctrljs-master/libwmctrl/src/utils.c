#include "./wmctrl.h"

bool init_wmctrl_lib() {
    XInitThreads();
    XSetErrorHandler(handler_x11_error);
    return true;
}

void free_window_cache(struct window_cache *wc) {
    if (wc->win_class)
        free(wc->win_class);
    free(wc);
}

void free_window_cache_list(struct window_cache_list *wcl) {
    struct window_cache *heap = wcl->heap;
    struct window_cache *tmp;
    while (heap) {
        tmp = heap;
        heap = heap->next;
        free_window_cache(tmp);
    }
    free(wcl);
}

struct window_cache_list *init_window_list_cache() {
    struct window_cache_list *wcl = malloc(sizeof(struct window_cache_list));

    if (!wcl)
        return NULL;

    wcl->heap = NULL;
    wcl->size = 0;

    return wcl;
}

struct window_cache *init_window_cache(Window win, const char *win_class, unsigned long win_pid) {
    struct window_cache *wc = malloc(sizeof(struct window_cache));
    if (!wc)
        return NULL;

    wc->win_id = win;
    wc->win_class = win_class ? strdup(win_class) : NULL;
    wc->win_pid = win_pid ? win_pid : 0;
    wc->dead_time = clock();
    wc->next = NULL;

    return wc;
}

struct window_cache *get_window_cache_by_id(struct window_cache_list *wcl, Window win) {
    struct window_cache *wc = NULL;

    if (!wcl->heap)
        return NULL;

    wc = wcl->heap;

    while (wc) {
        if (wc->win_id == win)
            return wc;
        wc = wc->next;
    }

    return NULL;
}

void add_window_cache(struct window_cache_list *wcl, Window win, const char *win_class, unsigned long win_pid) {
    struct window_cache *heap;
    struct window_cache *wc;

    if (!wcl)
        return;

    if (!wcl->heap) {
        wcl->heap = init_window_cache(win, win_class, win_pid);
        if (!wcl->heap)
            return;
        wcl->size++;
        return;
    }

    wc = init_window_cache(win, win_class, win_pid);
    if (!wc)
        return;

    heap = wcl->heap;
    while (heap->next) {

        if (heap->win_id == win) {

            if (!heap->win_class && win_class)
                heap->win_class = strdup(win_class);

            if (!heap->win_pid && win_pid)
                heap->win_pid = win_pid;

            return;
        }
        heap = heap->next;
    }

    heap->next = wc;
    wcl->size++;
}

int handler_x11_error(Display *d, XErrorEvent *e) {
    return 0;
}

char *get_error_message(enum STATES st) {
    char msg[512];
    switch (st) {
        case CAN_NOT_OPEN_DISPLAY:
            sprintf(msg, "CAN_NOT_OPEN_DISPLAY (%d)", st);
        break;
        case CAN_NOT_CLOSE_DISPLAY:
            sprintf(msg, "CAN_NOT_CLOSE_DISPLAY (%d)", st);
        break;
        case CAN_NOT_ACTIVATE_WINDOW:
            sprintf(msg, "CAN_NOT_ACTIVATE_WINDOW (%d)", st);
        break;
        case CAN_NOT_CHANGE_VIEWPORT:
            sprintf(msg, "CAN_NOT_CHANGE_VIEWPORT (%d)", st);
        break;
        case CAN_NOT_CHANGE_GEOMETRY:
            sprintf(msg, "CAN_NOT_CHANGE_GEOMETRY (%d)", st);
        break;
        case CAN_NOT_CLOSE_WINDOW:
            sprintf(msg, "CAN_NOT_CLOSE_WINDOW (%d)", st);
        break;
        case CAN_NOT_SET_WINDOW_ICON_NAME:
            sprintf(msg, "CAN_NOT_SET_WINDOW_ICON_NAME (%d)", st);
        break;
        case CAN_NOT_SET_WINDOW_TITLE:
            sprintf(msg, "CAN_NOT_SET_WINDOW_TITLE (%d)", st);
        break;
        case CAN_NOT_SET_WINDOW_STATE:
            sprintf(msg, "CAN_NOT_SET_WINDOW_STATE (%d)", st);
        break;
        case NO_WINDOW_FOUND:
            sprintf(msg, "NO_WINDOW_FOUND (%d)", st);
        break;
        case CAN_NOT_MOVE_RESIZE_WINDOW:
            sprintf(msg, "CAN_NOT_MOVE_RESIZE_WINDOW (%d)", st);
        break;
        case NO_WINDOW_ACTIVE_FOR_NOW:
            sprintf(msg, "NO_WINDOW_ACTIVE_FOR_NOW (%d)", st);
        break;
        case TOO_MANY_WINDOW_OPENED:
            sprintf(msg, "TOO_MANY_WINDOW_OPENED (%d)", st);
        break;
        case CAN_NOT_MINIMIZE_WINDOW:
            sprintf(msg, "CAN_NOT_MINIMIZE_WINDOW (%d)", st);
        break;
        case CAN_NOT_GET_WINDOW_ATTRIBUTES:
            sprintf(msg, "CAN_NOT_GET_WINDOW_ATTRIBUTES (%d)", st);
        break;
        default:
            sprintf(msg, "Unexpected error (%d)", st);
        break;
    }
    return strdup(msg);
}

void initializeWindowInfo(struct window_info *wi) {
    if (!wi) {
        return;
    }

    wi->win_client_machine    = NULL;
    wi->win_class             = NULL;
    wi->win_types             = NULL;
    wi->win_actions           = NULL;
    wi->win_states            = NULL;
    wi->win_name              = NULL;
    wi->win_visible_name      = NULL;
    wi->win_icon_name         = NULL;
    wi->win_visible_icon_name = NULL;
    wi->win_geometry          = NULL;
    wi->net_wm_strut          = NULL;
    wi->WM_NORMAL_HINTS       = NULL;
    wi->WM_HINTS              = NULL;
    wi->frame_extents         = NULL;

    wi->win_id                   = 0;
    wi->win_pid                  = 0;
    wi->desktop_number           = 0;
    wi->showing_desktop          = 0;
    wi->nbr_type                 = 0;
    wi->nbr_action               = 0;
    wi->nbr_state                = 0;
    wi->wm_normal_hints_supplied = 0;
    wi->wm_hints_supplied        = 0;
    wi->nbr_net_wm_strut         = 0;
}

struct window_info *create_empty_window_info() {
    struct window_info *wi = malloc(sizeof(struct window_info));
    if (!wi) {
        return NULL;
    }

    initializeWindowInfo(wi);
    return wi;
}

struct window_info *create_window_info(Display *disp, Window win, enum STATES *st) {
    struct window_info *wi;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        if (!disp) {
            if (st)
                *st = CAN_NOT_OPEN_DISPLAY;
        }
        displayProvided = false;
    }

    wi = create_empty_window_info();
    if (!wi) {
        *st = NO_WINDOW_FOUND;
        return NULL;
    }

    fill_window_info(disp, wi, win);

    if (!displayProvided) {
        XCloseDisplay(disp);
    }

    if (st)
        *st = WINDOW_PROPERTY_GET;

    return wi;
}

void fill_window_info(Display *disp, struct window_info *wi, Window win) {
    if (!disp || !wi) {
        return;
    }

    wi->win_id = win;
    wi->win_pid = get_window_pid(disp, win);
    wi->desktop_number = get_window_desktop(disp, win);
    wi->showing_desktop = get_window_shwing_desktop(disp, win);
    wi->win_client_machine = get_window_client_machine(disp, win);
    wi->win_class = get_window_class(disp, win);
    wi->win_types = get_window_types(disp, win, &wi->nbr_type);
    wi->win_actions = get_window_allowed_actions(disp, win, &wi->nbr_action);
    wi->win_states = get_window_states(disp, win, &wi->nbr_state);
    wi->win_name = get_window_name(disp, win);
    wi->win_visible_name = get_window_visible_name(disp, win);
    wi->win_icon_name = get_window_icon_name(disp, win);
    wi->win_visible_icon_name = get_window_visible_icon_name(disp, win);
    wi->win_geometry = get_window_geometry(disp, win);
    wi->frame_extents = get_window_frame_extents(disp, win);
    wi->WM_NORMAL_HINTS = XAllocSizeHints();
    XGetWMNormalHints(disp, win, wi->WM_NORMAL_HINTS, &wi->wm_normal_hints_supplied);
    wi->WM_HINTS = XAllocSizeHints();

    //XGetWMSizeHints(disp, win, wi->WM_HINTS, &wi->wm_hints_supplied, PAllHints);
    //wi->net_wm_strut = get_window_net_wm_strut(disp, win, &wi->nbr_net_wm_strut);
}

void copy_window_info(struct window_info *dest_wi, struct window_info *src_wi) {
    dest_wi->win_id = src_wi->win_id;
    dest_wi->win_pid = src_wi->win_pid;
    dest_wi->desktop_number = src_wi->desktop_number;
    dest_wi->showing_desktop = src_wi->showing_desktop;

    dest_wi->win_client_machine = src_wi->win_client_machine ? strdup(src_wi->win_client_machine) : NULL;
    dest_wi->win_class = src_wi->win_class ? strdup(src_wi->win_class) : NULL;

    if (src_wi->win_types) {
        size_t size = sizeof(struct type_desc) * src_wi->nbr_type;
        dest_wi->win_types = malloc(size);
        if (dest_wi->win_types) {
            for (size_t i = 0; i < src_wi->nbr_type; i++) {
                struct type_desc *win_types = dest_wi->win_types + i;
                win_types->flag = strdup((src_wi->win_types+i)->flag);
                win_types->number = (src_wi->win_types+i)->number;
            }
            dest_wi->nbr_type = src_wi->nbr_type;
        }
    }
    else {
        dest_wi->win_types = NULL;
    }

    if (src_wi->win_actions) {
        size_t size = sizeof(struct action_desc) * src_wi->nbr_action;
        dest_wi->win_actions = malloc(size);
        if (dest_wi->win_actions) {
            for (size_t i = 0; i < src_wi->nbr_action; i++) {
                struct action_desc *win_actions = dest_wi->win_actions + i;
                win_actions->flag = strdup((src_wi->win_actions+i)->flag);
                win_actions->number = (src_wi->win_actions+i)->number;
            }
            dest_wi->nbr_action = src_wi->nbr_action;
        }
    }
    else {
        dest_wi->win_actions = NULL;
    }

    if (src_wi->win_states) {
        size_t size = sizeof(struct state_desc) * src_wi->nbr_state;
        dest_wi->win_states = malloc(size);
        if (dest_wi->win_states) {
            for (size_t i = 0; i < src_wi->nbr_state; i++) {
                struct state_desc *win_states = dest_wi->win_states + i;
                win_states->flag = strdup((src_wi->win_states+i)->flag);
                win_states->number = (src_wi->win_states+i)->number;
            }
            dest_wi->nbr_state = src_wi->nbr_state;
        }
    }
    else {
        dest_wi->win_states = NULL;
    }

    dest_wi->win_name = src_wi->win_name ? strdup(src_wi->win_name) : NULL;
    dest_wi->win_visible_name = src_wi->win_visible_name ? strdup(src_wi->win_visible_name) : NULL;
    dest_wi->win_icon_name = src_wi->win_icon_name ? strdup(src_wi->win_icon_name) : NULL;
    dest_wi->win_visible_icon_name = src_wi->win_visible_icon_name ? strdup(src_wi->win_visible_icon_name) : NULL;

    if (src_wi->win_geometry) {
        dest_wi->win_geometry = malloc(sizeof(struct geometry));
        if (dest_wi->win_geometry) {
            memcpy(dest_wi->win_geometry, src_wi->win_geometry, sizeof(struct geometry));
        }
    }
    else {
        dest_wi->win_geometry = NULL;
    }
    if (src_wi->WM_NORMAL_HINTS) {
        XSizeHints *sh = XAllocSizeHints();
        memcpy(sh, src_wi->WM_NORMAL_HINTS, sizeof(XSizeHints));
        dest_wi->WM_NORMAL_HINTS = sh;
    }
    else {
        dest_wi->WM_NORMAL_HINTS = NULL;
    }

    dest_wi->wm_normal_hints_supplied = src_wi->wm_normal_hints_supplied;

    if (src_wi->WM_HINTS) {
        XSizeHints *sh = XAllocSizeHints();
        memcpy(sh, src_wi->WM_HINTS, sizeof(XSizeHints));
        dest_wi->WM_HINTS = sh;
    }
    else
        dest_wi->WM_HINTS = NULL;
    dest_wi->wm_hints_supplied = src_wi->wm_hints_supplied;
    if (src_wi->net_wm_strut) {
        size_t size = sizeof(Atom) * src_wi->nbr_net_wm_strut;
        dest_wi->net_wm_strut = malloc(size);
        if (dest_wi->net_wm_strut) {
            memcpy(dest_wi->net_wm_strut, src_wi->net_wm_strut, size);
            dest_wi->nbr_net_wm_strut = src_wi->nbr_net_wm_strut;
        }
    }
}

void free_window_info_properties(struct window_info *wi) {
    if (!wi) {
        return;
    }

    if (wi->win_client_machine) {
        free(wi->win_client_machine);
        wi->win_client_machine = NULL;
    }

    if (wi->win_class) {
        free(wi->win_class);
        wi->win_class = NULL;
    }

    if (wi->win_types) {
        for (size_t i = 0; i < wi->nbr_type; i++) {
            struct type_desc *desc = (wi->win_types + i);
            char *flag = desc->flag;
            if (flag) {
                free(flag);
            }
        }
        free(wi->win_types);
        wi->win_types = NULL;
    }

    if (wi->win_actions) {
        for (size_t i = 0; i < wi->nbr_action; i++) {
            struct action_desc* desc = wi->win_actions + i;
            if (desc) {
                char *flag = desc->flag;
                if (flag) {
                    free(flag);
                }
            }
        }
        free(wi->win_actions);
        wi->win_actions = NULL;
    }

    if (wi->win_states) {
        for (size_t i = 0; i < wi->nbr_state; i++) {
            struct state_desc *desc = (wi->win_states + i);
            if (desc) {
                char *flag = desc->flag;
                if (flag) {
                    free(flag);
                }
            }
        }
        free(wi->win_states);
        wi->win_states = NULL;
    }

    if (wi->win_name) {
        free(wi->win_name);
        wi->win_name = NULL;
    }

    if (wi->win_visible_name) {
        free(wi->win_visible_name);
        wi->win_visible_name = NULL;
    }

    if (wi->win_icon_name) {
        free(wi->win_icon_name);
        wi->win_icon_name = NULL;
    }

    if (wi->win_visible_icon_name) {
        free(wi->win_visible_icon_name);
        wi->win_visible_icon_name = NULL;
    }

    if (wi->win_geometry) {
        free(wi->win_geometry);
        wi->win_geometry = NULL;
    }

    if (wi->WM_NORMAL_HINTS) {
        XFree(wi->WM_NORMAL_HINTS);
        wi->WM_NORMAL_HINTS = NULL;
    }

    if (wi->WM_HINTS) {
        XFree(wi->WM_HINTS);
        wi->WM_HINTS = NULL;
    }

    if (wi->net_wm_strut) {
        free(wi->net_wm_strut);
        wi->net_wm_strut = NULL;
    }

    if  (wi->frame_extents) {
        free(wi->frame_extents);
        wi->frame_extents = NULL;
    }
}

void free_window_info(struct window_info *wi) {
    if (!wi) {
        return;
    }
    free_window_info_properties(wi);
    free(wi);
}

static struct window_list *create_window_list(Display *disp, Window *windows, size_t size) {
    Window win = 0;
    struct window_info *wi;
    struct window_list *wl;

    if (!windows) {
        return NULL;
    }

    wl = malloc(sizeof(struct window_list));
    if (!wl) {
        return NULL;
    }

    wl->client_list = malloc(sizeof(struct window_info) * size);
    if (!wl->client_list) {
        free(wl);
        return NULL;
    }

    for (size_t i = 0; i < size; i++) {
        win = windows[i];
        wi = wl->client_list + i;
        initializeWindowInfo(wi);
        fill_window_info(disp, wi, win);
    }

    wl->client_list_size = size;
    return wl;
}

struct window_list *list_windows(Display *disp, enum STATES *st) {
    Window *client_list;
    size_t client_list_size;
    struct window_list *wl;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp) {
        if (st) {
            *st = CAN_NOT_OPEN_DISPLAY;
        }
        return NULL;
    }

    client_list = get_client_list(disp, &client_list_size);
    if (client_list == NULL) {
        if (st) {
            *st = CAN_NOT_GET_CLIENT_LIST;
        }
        return NULL;
    }

    client_list_size /= sizeof(Window);
    wl = create_window_list(disp, client_list, client_list_size);

    if (!wl) {
        if (st) {
            *st = CAN_NOT_ALLOCATE_MEMORY;
        }
        return NULL;
    }
    free(client_list);

    if (st) {
        *st = CLIENT_LIST_GET;
    }

    if (!displayProvided) {
        XCloseDisplay(disp);
    }

    return wl;
}

void free_window_list(struct window_list *wl) {
    if (!wl) {
        return;
    }

    for (size_t i = 0;i < wl->client_list_size; i++) {
        free_window_info_properties(wl->client_list + i);
    }

    if (wl->client_list) {
        free(wl->client_list);
    }

    free(wl);
}

void print_window_info(struct window_info *wi) {
    printf("\n");
    printf("| WIN_ID: %ld\n", wi->win_id);

    if (wi->win_pid)
        printf("| Pid: %ld\n", wi->win_pid);

    if (wi->win_class)
        printf("| Class: %s\n", wi->win_class);

    if (wi->win_name)
        printf("| Name: %s\n", wi->win_name);

    if (wi->win_visible_name)
        printf("| Visible_NAME: %s\n", wi->win_visible_name);

    if (wi->win_icon_name)
        printf("| ICON_NAME:%s\n", wi->win_icon_name);

    if (wi->win_visible_icon_name)
        printf("| VISIBLE_ICON_NAME:%s\n", wi->win_visible_icon_name);

    if (wi->desktop_number)
        printf("| Desktop: %ld\n", wi->desktop_number);

    if (wi->nbr_type > 0) {
        printf("| Types: %ld\n", wi->nbr_type);
        for (size_t i = 0; i < wi->nbr_type; i++) {
            char *flag = (wi->win_types+i)->flag;
            Atom number = (wi->win_types+i)->number;
            printf("| \t%s:%ld\n", flag, number);
        }
    }

    if (wi->nbr_action > 0) {
        printf("| Allowed actions: %ld\n", wi->nbr_action);
        for (size_t i = 0; i < wi->nbr_action; i++) {
            char *flag = (wi->win_actions+i)->flag;
            Atom number = (wi->win_actions+i)->number;
            printf("| \t%s:%ld\n", flag, number);
        }
    }

    if (wi->nbr_state > 0) {
        printf("| States: %ld\n", wi->nbr_state);
        for (size_t i = 0; i < wi->nbr_state; i++) {
            char *flag = (wi->win_states+i)->flag;
            Atom number = (wi->win_states+i)->number;
            printf("| \t%s:%ld\n", flag, number);
        }
    }

    if( wi->win_client_machine)
        printf("| CLIENT_MACHINE: %s\n", wi->win_client_machine);

    if (wi->win_geometry) {
        printf("| Geometry: \n");
        printf("| \twidth: %d\n", wi->win_geometry->width);
        printf("| \theight: %d\n", wi->win_geometry->height);
        printf("| \tx: %d\n", wi->win_geometry->x);
        printf("| \ty: %d\n", wi->win_geometry->y);
    }

    if (wi->WM_NORMAL_HINTS) {
        printf("| WM_NORMAL_HINTS: \n");
        printf("| \twin_gravity: %d\n", wi->WM_NORMAL_HINTS->win_gravity);
        printf("| \theight: %d\n", wi->WM_NORMAL_HINTS->height);
        printf("| \twidth: %d\n", wi->WM_NORMAL_HINTS->width);
        printf("| \tx: %d\n", wi->WM_NORMAL_HINTS->x);
        printf("| \ty: %d\n", wi->WM_NORMAL_HINTS->y);
        printf("| \tbase_width: %d\n", wi->WM_NORMAL_HINTS->base_width);
        printf("| \tbase_height: %d\n", wi->WM_NORMAL_HINTS->base_height);
        printf("| \tmin_width: %d\n", wi->WM_NORMAL_HINTS->min_width);
        printf("| \tmin_height: %d\n", wi->WM_NORMAL_HINTS->min_height);
        printf("| \tmin_aspect:\n");
        printf("| \t\tnumerator:%d\n", wi->WM_NORMAL_HINTS->min_aspect.x);
        printf("| \t\tdenominator:%d\n", wi->WM_NORMAL_HINTS->min_aspect.y);
        printf("| \tmax_width: %d\n", wi->WM_NORMAL_HINTS->max_width);
        printf("| \tmax_height: %d\n", wi->WM_NORMAL_HINTS->max_height);
        printf("| \tmax_aspect:\n");
        printf("| \t\tnumerator:%d\n", wi->WM_NORMAL_HINTS->max_aspect.x);
        printf("| \t\tdenominator:%d\n", wi->WM_NORMAL_HINTS->max_aspect.y);
        printf("| \twidth_inc: %d\n", wi->WM_NORMAL_HINTS->width_inc);
        printf("| \theight_inc: %d\n", wi->WM_NORMAL_HINTS->height_inc);
    }

    if (wi->WM_HINTS) {
        printf("| WM_HINTS: \n");
        printf("| \twin_gravity: %d\n", wi->WM_HINTS->win_gravity);
        printf("| \theight: %d\n", wi->WM_HINTS->height);
        printf("| \twidth: %d\n", wi->WM_HINTS->width);
        printf("| \tx: %d\n", wi->WM_HINTS->x);
        printf("| \ty: %d\n", wi->WM_HINTS->y);
        printf("| \tbase_width: %d\n", wi->WM_HINTS->base_width);
        printf("| \tbase_height: %d\n", wi->WM_HINTS->base_height);
        printf("| \tmin_width: %d\n", wi->WM_HINTS->min_width);
        printf("| \tmin_height: %d\n", wi->WM_HINTS->min_height);
        printf("| \tmin_aspect:\n");
        printf("| \t\tnumerator:%d\n", wi->WM_HINTS->min_aspect.x);
        printf("| \t\tdenominator:%d\n", wi->WM_HINTS->min_aspect.y);
        printf("| \tmax_width: %d\n", wi->WM_HINTS->max_width);
        printf("| \tmax_height: %d\n", wi->WM_HINTS->max_height);
        printf("| \tmax_aspect:\n");
        printf("| \t\tnumerator:%d\n", wi->WM_HINTS->max_aspect.x);
        printf("| \t\tdenominator:%d\n", wi->WM_HINTS->max_aspect.y);
        printf("| \twidth_inc: %d\n", wi->WM_HINTS->width_inc);
        printf("| \theight_inc: %d\n", wi->WM_HINTS->height_inc);
    }

    if (wi->net_wm_strut) {
        //printf("TEST----- %ld\n", wi->nbr_net_wm_strut);
        for (size_t i = 0; i < wi->nbr_net_wm_strut; i++)
            printf("%ld\n", wi->net_wm_strut[i]);
        //printf("TEST-----\n");
    }
    printf("\n");
}

char *get_output_str(char *str) {
    char *out;

    if (str == NULL) {
        return NULL;
    }
    out = strdup(str);
    return out;
}

Window *get_client_list(Display *disp, unsigned long *size) {
    Window *client_list = NULL;
    client_list = (Window *)get_property(disp, DefaultRootWindow(disp), XA_WINDOW, "_NET_CLIENT_LIST", size);

    if (client_list == NULL) {
        client_list = (Window *)get_property(disp, DefaultRootWindow(disp), XA_CARDINAL, "_WIN_CLIENT_LIST", size);
        if (client_list == NULL) {
            fputs("Cannot get client list properties. \n (_NET_CLIENT_LIST or _WIN_CLIENT_LIST) \n", stderr);
            *size = 0;
            return NULL;
        }
    }
    return client_list;
}

bool client_msg(Display *disp, Window win, char *msg,
        unsigned long data0, unsigned long data1, 
        unsigned long data2, unsigned long data3,
        unsigned long data4) {
    XEvent event;
    long mask = SubstructureRedirectMask | SubstructureNotifyMask;

    event.xclient.type = ClientMessage;
    event.xclient.serial = 0;
    event.xclient.send_event = true;
    event.xclient.message_type = XInternAtom(disp, msg, false);
    event.xclient.window = win;
    event.xclient.format = 32;
    event.xclient.data.l[0] = data0;
    event.xclient.data.l[1] = data1;
    event.xclient.data.l[2] = data2;
    event.xclient.data.l[3] = data3;
    event.xclient.data.l[4] = data4;

    if (XSendEvent(disp, DefaultRootWindow(disp), false, mask, &event)) {
        return true;
    }
    else {
        fprintf(stderr, "Cannot send %s event.\n", msg);
        return false;
    }
}