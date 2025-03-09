#include "./wmctrl.h"

static bool activate_window(Display *disp, Window win,
        bool switch_desktop) {
    unsigned long *desktop;
    /* desktop ID */
    if ((desktop = (unsigned long *)get_property(disp, win,
            XA_CARDINAL, "_NET_WM_DESKTOP", NULL)) == NULL) {
        if ((desktop = (unsigned long *)get_property(disp, win,
                XA_CARDINAL, "_WIN_WORKSPACE", NULL)) == NULL) {
           return false;
        }
    }

    if (switch_desktop && desktop) {
        if (client_msg(disp, DefaultRootWindow(disp), 
                    "_NET_CURRENT_DESKTOP", 
                    *desktop, 0, 0, 0, 0) != True) {
            return false;
        }
    }

    XMapRaised(disp, win);
    if (desktop)
        free(desktop);

    return client_msg(disp, win, "_NET_ACTIVE_WINDOW", 
            0, 0, 0, 0, 0);
}

//ACTIVE SECTION
enum STATES active_window_by_id(Display *disp, Window wid) {
    bool res;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    res = activate_window(disp, wid, false);

    if (!displayProvided)
        XCloseDisplay(disp);

    return res ? WINDOW_ACTIVATED : CAN_NOT_ACTIVATE_WINDOW;
}

enum STATES active_windows_by_pid(Display *disp, unsigned long pid) {
    size_t size;
    Window win;
    unsigned long current_pid;
    struct window_cache *wc;
    enum STATES st;
    Window *windows;
    struct window_cache_list *wcl = init_window_list_cache();
    bool displayProvided = true;
    bool window_found = false;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    windows = get_client_list(disp, &size);

    if (!windows)
        return CAN_NOT_GET_CLIENT_LIST;

    size /= sizeof(Window);
    if (!windows) {
        if (!displayProvided)
            XCloseDisplay(disp);
        return CAN_NOT_ALLOCATE_MEMORY;
    }

    for (size_t i = 0; i < size; i++) {
        win = windows[i];
        wc = get_window_cache_by_id(wcl, win);

        if (wc && wc->win_pid) {
            current_pid = wc->win_pid;
        }
        else {
            current_pid = get_window_pid(disp, win);
            if (current_pid) {
                add_window_cache(wcl, win, NULL, current_pid);
            }
            else {
                continue;
            }
        }

        if (current_pid == pid) {
            st = active_window_by_id(disp, win);
            if (st != WINDOW_ACTIVATED)
                return CAN_NOT_ACTIVATE_WINDOW;
            XSync(disp, False);
            window_found = true;
        }
    }

    free(windows);
    free_window_cache_list(wcl);
    if (!displayProvided)
        XCloseDisplay(disp);

    if (!window_found)
        return NO_WINDOW_FOUND;

    return WINDOWS_ACTIVATED;
}

enum STATES active_windows_by_class_name(Display *disp, const char *class_name) {
    size_t size;
    Window win;
    Window *windows;
    char *current_class_name;
    struct window_cache *wc;
    enum STATES st;
    struct window_cache_list *wcl = init_window_list_cache();
    bool displayProvided = true;
    bool window_found = false;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    windows = get_client_list(disp, &size);

    if (!windows)
        return CAN_NOT_GET_CLIENT_LIST;

    if (!wcl)
        return CAN_NOT_ALLOCATE_MEMORY;

    size /= sizeof(Window);
    if (!windows) {
        if (!displayProvided)
            XCloseDisplay(disp);
        return CAN_NOT_ALLOCATE_MEMORY;
    }

    for (size_t i = 0; i < size; i++) {
        win = windows[i];
        wc = get_window_cache_by_id(wcl, win);
        if (wc && wc->win_class)
            current_class_name = strdup(wc->win_class);
        else {
            current_class_name = get_window_class(disp, win);
            if (current_class_name)
                add_window_cache(wcl, win, current_class_name, 0);
            else {
                continue;
            }
        }

        if (strcmp(current_class_name, class_name) == 0) {
            st = active_window_by_id(disp, win);
            if (st != WINDOW_ACTIVATED)
                return CAN_NOT_ACTIVATE_WINDOW;
            XSync(disp, False);
            window_found = true;
        }

        free(current_class_name);
    }

    free(windows);
    free_window_cache_list(wcl);
    if (!displayProvided)
        XCloseDisplay(disp);

    if (!window_found)
        return NO_WINDOW_FOUND;

    return WINDOWS_ACTIVATED;
}

//CLOSE SECTION
enum STATES close_window_by_id(Display *disp, Window win) {
    bool res;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    res = client_msg(disp, win, "_NET_CLOSE_WINDOW", 
            0, 0, 0, 0, 0);

    if (!displayProvided)
        XCloseDisplay(disp);

    return res ? WINDOW_CLOSED : CAN_NOT_CLOSE_WINDOW;
}

static enum STATES close_windows_by(Display *disp, char mode, const void *data) {
    unsigned long size;
    unsigned long current_pid;
    unsigned long pid;
    const char *class_name;
    char *current_class_name;
    Window win;
    struct window_cache *wc;
    struct window_cache_list *wcl = init_window_list_cache();
    Window *windows = get_client_list(disp, &size);
    bool win_found = false;

    if (!wcl) {
        if (windows)
            free(windows);
        return CAN_NOT_ALLOCATE_MEMORY;
    }

    if (!windows) {
        free_window_cache_list(wcl);
        return CAN_NOT_GET_CLIENT_LIST;
    }

    if (!size) {
        free(windows);
        free_window_cache_list(wcl);
        return CAN_NOT_GET_CLIENT_LIST;
    }

    size /= sizeof(Window);

    switch (mode) {
        case 'p': {
            pid = *((unsigned long*) data);
            for (size_t i = 0; i < size; i++) {
                win = windows[i];
                wc = get_window_cache_by_id(wcl, win);
                if (wc && wc->win_pid)
                    current_pid = wc->win_pid;
                else {
                    current_pid = get_window_pid(disp, win);
                    if (current_pid)
                        add_window_cache(wcl, win, NULL, current_pid);
                    else
                        continue;
                }

                if (pid == current_pid) {
                    close_window_by_id(disp, win);
                    XSync(disp, False);
                    free(windows);
                    windows = get_client_list(disp, &size);
                    size /= sizeof(Window);

                    i = 0;
                    win_found = true;

                    if (!windows)
                        return CAN_NOT_GET_CLIENT_LIST;
                }
            }
            break;
        }
        case 'c': {
            class_name = data;
            for (size_t i = 0; i < size; i++) {
                win = windows[i];
                wc = get_window_cache_by_id(wcl, win);
                if (wc && wc->win_class)
                    current_class_name = strdup(wc->win_class);
                else {
                    current_class_name = get_window_class(disp, win);
                    if (current_class_name)
                        add_window_cache(wcl, win, current_class_name, 0);
                    else
                        continue;
                }

                if (strcmp(class_name, current_class_name) == 0) {
                    close_window_by_id(disp, win);
                    XSync(disp, False);
                    free(windows);
                    windows = get_client_list(disp, &size);
                    size /= sizeof(Window);

                    i = 0;
                    win_found = true;
                }
                free(current_class_name);
            }
            break;
        }
    }
    free(windows);
    free_window_cache_list(wcl);

    if (!win_found)
        return NO_WINDOW_FOUND;

    return WINDOWS_CLOSED;
}

enum STATES close_windows_by_pid(Display *disp, unsigned long pid) {
    bool displayProvided = true;
    enum STATES st;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    st = close_windows_by(disp, 'p', &pid);

    if (!displayProvided)
        XCloseDisplay(disp);

    return st;
}

enum STATES close_windows_by_class_name(Display *disp, const char *class_name) {
    enum STATES st;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    st = close_windows_by(disp, 'c',class_name);

    if (!displayProvided)
        XCloseDisplay(disp);

    return st;
}

//EDIT PROPERTIES SECTION
enum STATES  window_set_icon_name(Display *disp, Window win, const char *_net_wm_icon_name) {
    int res;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    res =  XChangeProperty(disp, win, XInternAtom(disp, "_NET_WM_ICON_NAME", False), 
            XInternAtom(disp, "UTF8_STRING", False), 8, PropModeReplace,
            (const unsigned char *)_net_wm_icon_name, strlen(_net_wm_icon_name));

    if (!displayProvided)
        XCloseDisplay(disp);

    return res ? WINDOW_ICON_NAME_SET : CAN_NOT_SET_WINDOW_ICON_NAME;
}

enum STATES window_set_title(Display *disp, Window win, const char *_net_wm_name) {
    int res;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    res = XChangeProperty(disp, win, XInternAtom(disp, "_NET_WM_NAME", False), 
            XInternAtom(disp, "UTF8_STRING", False), 8, PropModeReplace,
            (const unsigned char *)_net_wm_name, strlen(_net_wm_name));

    if (!displayProvided)
        XCloseDisplay(disp);

    return res ? WINDOW_TITLE_SET : CAN_NOT_SET_WINDOW_TITLE;
}

/**
 * action _NET_WM_STATE_REMOVE | _NET_WM_STATE_ADD | _NET_WM_STATE_TOGGLE
 * prop1, prop2: modal_sticky | maximized_vert | maximized_horz |
    shaded | skip_taskbar | skip_pager | hidden | fullscreen | above
**/
enum STATES window_state(Display *disp, Window win, unsigned long action, 
        char *prop1_str, char *prop2_str) {
    bool res;
    bool displayProvided = true;
    char *uppercase_prop1;
    char *uppercase_prop2;
    char *tmp_prop1;
    char *tmp_prop2;
    Atom prop1;
    Atom prop2;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    uppercase_prop1 = strdup(prop1_str);
    for (size_t i = 0; uppercase_prop1[i]; i++)
        uppercase_prop1[i] = toupper(uppercase_prop1[i]);

    tmp_prop1 = malloc(sizeof(char) * (strlen(uppercase_prop1) + 64));
    sprintf(tmp_prop1, "_NET_WM_STATE_%s", uppercase_prop1);

    prop1 = XInternAtom(disp, tmp_prop1, False);
    free(uppercase_prop1);
    free(tmp_prop1);

    prop2 = 0;
    if (strcmp(prop2_str, "") != 0) {
        uppercase_prop2 = strdup(prop2_str);
        for (size_t i = 0; uppercase_prop2[i]; i++)
            uppercase_prop2[i] = toupper(uppercase_prop2[i]);
        tmp_prop2 = malloc(sizeof(char) * (strlen(prop2_str) + 64));
        sprintf(tmp_prop2, "_NET_WM_STATE_%s", uppercase_prop2);

        prop2 = XInternAtom(disp, tmp_prop2, False);
        free(uppercase_prop2);
        free(tmp_prop2);
    }

    res = client_msg(disp, win, "_NET_WM_STATE", 
        action, (unsigned long)prop1, (unsigned long)prop2, 0, 0);

    if (!displayProvided)
        XCloseDisplay(disp);

    return res ? WINDOW_STATE_SET : CAN_NOT_SET_WINDOW_STATE;
}

enum STATES change_viewport (Display *disp, unsigned long x, unsigned long y) {
    bool res;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    res = client_msg(disp, DefaultRootWindow(disp), "_NET_DESKTOP_VIEWPORT", 
        x, y, 0, 0, 0);

    if (!displayProvided)
        XCloseDisplay(disp);

    return res ? VIEWPORT_CHANGED : CAN_NOT_CHANGE_VIEWPORT;
}

enum STATES change_geometry(Display *disp, unsigned long x, unsigned long y) {
    bool res;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    res = client_msg(disp, DefaultRootWindow(disp), "_NET_DESKTOP_GEOMETRY", 
        x, y, 0, 0, 0);

    if (!displayProvided)
        XCloseDisplay(disp);

    return res ? GEOMETRY_CHANGED : CAN_NOT_CHANGE_GEOMETRY;
}

enum STATES window_allow_all_sizes(Display *disp, Window win) {
    XSizeHints *xsh;
    bool displayProvided = true;

    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    xsh = XAllocSizeHints();
    if (!xsh)
        return CAN_NOT_ALLOCATE_MEMORY;

    xsh->min_width  = 0;
    xsh->min_height = 0;
    xsh->max_width  = 0;
    xsh->max_height = 0;

    XSetWMNormalHints(disp, win, xsh);

    if (!displayProvided)
        XCloseDisplay(disp);

    XFree(xsh);
    return WINDOW_ALLOWED_ALL_SIZE;
}

enum STATES window_raise(Display *disp, Window win) {
    bool displayProvided = true;
    if (!disp) {
        disp = XOpenDisplay(NULL);
        displayProvided = false;
    }

    if (!disp)
        return CAN_NOT_OPEN_DISPLAY;

    int res = XRaiseWindow(disp, win);

    if (displayProvided)
        XCloseDisplay(disp);

    return res ? WINDOW_RAISED : CAN_NOT_RAISE_WINDOW;
}

/*
int action_window (Display *disp, Window win, char mode) {

        
        case 't':
            // move the window to the specified desktop => -r -t /
            return window_to_desktop(disp, win, atoi(options.param));
        
        case 'R':
            // move the window to the current desktop and activate it => -r /
            if (window_to_desktop(disp, win, -1) == EXIT_SUCCESS) {
                usleep(100000); // 100 ms - make sure the WM has enough
                    //time to move the window, before we activate it /
                return activate_window(disp, win, FALSE);
            }
            else {
                return EXIT_FAILURE;
            }

        case 'N': case 'I': case 'T':
            window_set_title(disp, win, options.param, mode);
            return EXIT_SUCCESS;

        default:
            fprintf(stderr, "Unknown action: '%c'\n", mode);
            return EXIT_FAILURE;
    }
}

static int action_window_pid (Display *disp, char mode) {
    unsigned long wid;

    if (sscanf(options.param_window, "0x%lx", &wid) != 1 &&
            sscanf(options.param_window, "0X%lx", &wid) != 1 &&
            sscanf(options.param_window, "%lu", &wid) != 1) {
        fputs("Cannot convert argument to number.\n", stderr);
        return EXIT_FAILURE;
    }

    return action_window(disp, (Window)wid, mode);
}

static int action_window_str (Display *disp, char mode) {
    Window activate = 0;
    Window *client_list;
    unsigned long client_list_size;
    int i;
    
    if (strcmp(SELECT_WINDOW_MAGIC, options.param_window) == 0) {
        activate = Select_Window(disp);
        if (activate) {
            return action_window(disp, activate, mode);
        }
        else {
            return EXIT_FAILURE;
        }
    }
    if (strcmp(ACTIVE_WINDOW_MAGIC, options.param_window) == 0) {
        activate = get_active_window(disp);
        if (activate)
        {
            return action_window(disp, activate, mode);
        }
        else
        {
            return EXIT_FAILURE;
        }
    }
    else {
        if ((client_list = get_client_list(disp, &client_list_size)) == NULL) {
            return EXIT_FAILURE; 
        }
        
        for (i = 0; i < client_list_size / sizeof(Window); i++) {
 			char *match_utf8;
 			if (options.show_class) {
 	            match_utf8 = get_window_class(disp, client_list[i]); // UTF8 /
 			}
 			else {
 				match_utf8 = get_window_title(disp, client_list[i]); // UTF8 /
 			}
            if (match_utf8) {
                char *match;
                char *match_cf;
                char *match_utf8_cf = NULL;
                if (envir_utf8) {
                    match = g_strdup(options.param_window);
                    match_cf = g_utf8_casefold(options.param_window, -1);
                }
                else {
                    if (! (match = g_locale_to_utf8(options.param_window, -1, NULL, NULL, NULL))) {
                        match = g_strdup(options.param_window);
                    }
                    match_cf = g_utf8_casefold(match, -1);
                }
                
                if (!match || !match_cf) {
                    continue;
                }

                match_utf8_cf = g_utf8_casefold(match_utf8, -1);

                if ((options.full_window_title_match && strcmp(match_utf8, match) == 0) ||
                        (!options.full_window_title_match && strstr(match_utf8_cf, match_cf))) {
                    activate = client_list[i];
                    g_free(match);
                    g_free(match_cf);
                    g_free(match_utf8);
                    g_free(match_utf8_cf);
                    break;
                }
                g_free(match);
                g_free(match_cf);
                g_free(match_utf8);
                g_free(match_utf8_cf);
            }
        }
        g_free(client_list);

        if (activate) {
            return action_window(disp, activate, mode);
        }
        else {
            return EXIT_FAILURE;
        }
    }
}*/