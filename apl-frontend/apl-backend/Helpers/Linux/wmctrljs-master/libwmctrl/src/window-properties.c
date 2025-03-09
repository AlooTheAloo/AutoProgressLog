#include "./wmctrl.h"

#define _NET_WM_WINDOW_TYPES ((char const*[]) { \
    "_NET_WM_WINDOW_TYPE_DESKTOP", \
    "_NET_WM_WINDOW_TYPE_DOCK", \
    "_NET_WM_WINDOW_TYPE_TOOLBAR", \
    "_NET_WM_WINDOW_TYPE_MENU", \
    "_NET_WM_WINDOW_TYPE_UTILITY", \
    "_NET_WM_WINDOW_TYPE_SPLASH", \
    "_NET_WM_WINDOW_TYPE_DIALOG", \
    "_NET_WM_WINDOW_TYPE_NORMAL" \
})
#define NB_ALLOWED_TYPES 8

#define _NET_WM_ALLOWED_ACTIONS ((char const*[]) { \
    "_NET_WM_ACTION_MOVE", "_NET_WM_ACTION_RESIZE", \
    "_NET_WM_ACTION_MINIMIZE", "_NET_WM_ACTION_SHADE", \
    "_NET_WM_ACTION_STICK", "_NET_WM_ACTION_MAXIMIZE_HORZ", \
    "_NET_WM_ACTION_MAXIMIZE_VERT", "_NET_WM_ACTION_FULLSCREEN",\
    "_NET_WM_ACTION_CHANGE_DESKTOP", "_NET_WM_ACTION_CLOSE" \
})
#define NB_ALLOWED_ACTIONS 10

#define _NET_WM_STATE ((char const*[]) { \
    "_NET_WM_STATE_MODAL", "_NET_WM_STATE_STICKY",\
    "_NET_WM_STATE_MAXIMIZED_VERT", "_NET_WM_STATE_MAXIMIZED_HORZ",\
    "_NET_WM_STATE_SHADED", "_NET_WM_STATE_SKIP_TASKBAR",\
    "_NET_WM_STATE_SKIP_PAGER", "_NET_WM_STATE_HIDDEN",\
    "_NET_WM_STATE_FULLSCREEN", "_NET_WM_STATE_ABOVE",\
    "_NET_WM_STATE_BELOW", "_NET_WM_STATE_DEMANDS_ATTENTION"\
})
#define NB_WM_STATE 12

char *get_property(Display *disp, Window win,
        Atom xa_prop_type, char *prop_name, size_t *size) {

    Atom xa_prop_name;
    Atom xa_ret_type;
    int ret_format;
    unsigned long ret_nitems;
    unsigned long ret_bytes_after;
    size_t tmp_size;
    unsigned char *ret_prop;
    char *ret;

    xa_prop_name = XInternAtom(disp, prop_name, false);

    /* MAX_PROPERTY_VALUE_LEN / 4 explanation (XGetWindowProperty manpage):
     *
     * long_length = Specifies the length in 32-bit multiples of the
     *               data to be retrieved.
     *
     * NOTE:  see 
     * http://mail.gnome.org/archives/wm-spec-list/2003-March/msg00067.html
     * In particular:
     *
     * 	When the X window system was ported to 64-bit architectures, a
     * rather peculiar design decision was made. 32-bit quantities such
     * as Window IDs, atoms, etc, were kept as longs in the client side
     * APIs, even when long was changed to 64 bits.
     *
     */
    if (XGetWindowProperty(disp, win, xa_prop_name, 0, MAX_PROPERTY_VALUE_LEN / 4, false,
            xa_prop_type, &xa_ret_type, &ret_format,     
            &ret_nitems, &ret_bytes_after, &ret_prop) != Success) {
        //fprintf(stderr, "Cannot get %s property, for window %ld\n", prop_name, win);
        if (size) {
            *size = 0;
        }
        return NULL;
    }

    if (xa_ret_type != xa_prop_type) {
        if (size) {
            *size = 0;
        }
        XFree(ret_prop);
        return NULL;
    }

    /* null terminate the result to make string handling easier */
    tmp_size = (ret_format / 8) * ret_nitems;
    /* Correct 64 Architecture implementation of 32 bit data */
    if (ret_format==32) { 
        tmp_size *= sizeof(long)/4;
    }

    ret = malloc(tmp_size + 1);

    if (!ret) {
        if (size) {
            *size = 0;
        }
        XFree(ret_prop);
        return NULL;
    }

    memcpy(ret, ret_prop, tmp_size);
    ret[tmp_size] = '\0';

    if (size) {
        *size = tmp_size;
    }

    XFree(ret_prop);
    return ret;
}

//_NET_WM_PID
unsigned long get_window_pid(Display *disp, Window win) {
    unsigned long pid;
    unsigned long *wm_pid;

    if (!disp)
        return 0;

    if (! (wm_pid = (unsigned long *)get_property(disp, win, XA_CARDINAL, "_NET_WM_PID", NULL))) {
        return 0;
    }
    pid = *wm_pid;

    free(wm_pid);
    return pid;
}

//_NET_WM_DESKTOP
unsigned long get_window_desktop(Display *disp, Window win) {
    unsigned long *net_wm_desktop = NULL;
    net_wm_desktop = (unsigned long *)get_property(disp, win, 
        XA_CARDINAL, "_NET_WM_DESKTOP", NULL);
    if (!net_wm_desktop) {
        net_wm_desktop = (unsigned long *)get_property(disp, win,
                    XA_CARDINAL, "_WIN_WORKSPACE", NULL);
        return 0;
    }
    unsigned long desktop = *net_wm_desktop;
    free(net_wm_desktop);
    return desktop;
}

//_NET_SHOWING_DESKTOP
unsigned long get_window_shwing_desktop(Display *disp, Window win) {
    unsigned long *ret = NULL;
    if (! (ret = (unsigned long *)get_property(disp, win,
                    XA_CARDINAL, "_NET_SHOWING_DESKTOP", NULL))) {
        return 0;
    }

    unsigned long showing_desktop = *ret;
    free(ret);
    return showing_desktop;
}

//WM_CLIENT_MACHINE
char *get_window_client_machine(Display *disp, Window win) {
    char *wm_client_machine = get_property(disp, win,
                XA_STRING, "WM_CLIENT_MACHINE", NULL);
    return wm_client_machine;
}

//WM_CLASS
char *get_window_class(Display *disp, Window win) {
    char *class_utf8;
    char *wm_class;
    char *p_0;
    size_t size;

    wm_class = get_property(disp, win, XA_STRING, "WM_CLASS", &size);
    if (wm_class) {
        p_0 = strchr(wm_class, '\0');
        if (wm_class + size - 1 > p_0)
            *(p_0) = '.';
        class_utf8 = strdup(wm_class);
    }
    else
        class_utf8 = NULL;

    if (wm_class)
        free(wm_class);

    return class_utf8;
}

//_NET_WM_WINDOW_TYPE
struct type_desc *get_window_types(Display *disp, Window win, size_t *size) {
    struct type_desc *types = NULL;
    Atom *atoms_type = (Atom *)get_property(disp, win, XA_ATOM,
            "_NET_WM_WINDOW_TYPE", size);
    if (atoms_type) {
        *size = *size / sizeof(Atom);
        size_t counter = 0;
        types = malloc(sizeof(struct type_desc) * (*size));
        for (size_t i = 0; i < *size; i++) {
            Atom atom_type = atoms_type[i];
            for (size_t j = 0; j < NB_ALLOWED_TYPES; j++) {
                const char *type = _NET_WM_WINDOW_TYPES[j];
                Atom type_atom = XInternAtom(disp, type, False);
                if (atom_type == type_atom) {
                    (types + counter)->flag = strdup(type);
                    (types + counter)->number = type_atom;
                    counter++;
                }
            }
        }

        if (counter == 0) {
            free(types);
            types = NULL;
        }
        *size = counter;
    }
    else 
        *size = 0;

    free(atoms_type);
    return types;
}

//_NET_WM_ALLOWED_ACTIONS
struct action_desc *get_window_allowed_actions(Display *disp, Window win, size_t *size) {
    struct action_desc *actions = NULL;
    Atom *atoms_action = (Atom *)get_property(disp, win, XA_ATOM,
            "_NET_WM_ALLOWED_ACTIONS", size);
    if (atoms_action) {
        *size = *size / 8;
        size_t counter = 0;
        actions = malloc(sizeof(struct action_desc) * (*size));
        for (size_t i = 0; i < *size; i++) {
            Atom atom_action = atoms_action[i];
            for (size_t j = 0; j < NB_ALLOWED_ACTIONS; j++) {
                const char *action = _NET_WM_ALLOWED_ACTIONS[j];
                Atom action_atom = XInternAtom(disp, action, False);
                if (atom_action == action_atom) {
                    (actions + counter)->flag = strdup(action);
                    (actions + counter)->number = action_atom;
                    counter++;
                }
            }
        }

        if (counter == 0) {
            free(actions);
            actions = NULL;
        }
        *size = counter;
    }
    else 
        *size = 0;

    free(atoms_action);
    return actions;
}

//_NET_WM_STATE
struct state_desc *get_window_states(Display *disp, Window win, size_t *size) {
    struct state_desc *states = NULL;
    Atom *atoms_state = (Atom *)get_property(disp, win, XA_ATOM,
            "_NET_WM_STATE", size);
    if (atoms_state) {
        *size = *size / sizeof(Atom);
        size_t counter = 0;
        states = malloc(sizeof(struct state_desc) * (*size));
        for (size_t i = 0; i < *size; i++) {
            Atom atom_state = atoms_state[i];
            for (size_t j = 0; j < NB_WM_STATE; j++) {
                const char *state = _NET_WM_STATE[j];
                Atom state_atom = XInternAtom(disp, state, false);
                if (atom_state == state_atom) {
                    (states + counter)->flag = strdup(state);
                    (states + counter)->number = state_atom;
                    counter++;
                }
            }
        }

        if (counter == 0) {
            free(states);
            states = NULL;
        }
        *size = counter;
    }
    else 
        *size = 0;

    free(atoms_state);
    return states;
}

//_NET_WM_NAME
char *get_window_name(Display *disp, Window win) {
    char *title_utf8 = NULL;
    char *wm_name = NULL;
    char *net_wm_name = NULL;

    wm_name = get_property(disp, win, XA_STRING, "WM_NAME", NULL);
    net_wm_name = get_property(disp, win, 
            XInternAtom(disp, "UTF8_STRING", false), "_NET_WM_NAME", NULL);

    if (net_wm_name) {
        title_utf8 = strdup(net_wm_name);
    }
    else {
        if (wm_name) {
            title_utf8 = strdup(wm_name);
        }
        else {
            title_utf8 = NULL;
        }
    }

    free(wm_name);
    free(net_wm_name);

    return title_utf8;
}

//_NET_FRAME_EXTENTS
long *get_window_frame_extents(Display *disp, Window win) {
    long *extents = NULL;
    long *tmpextents;
    Atom actual_type;
    int actual_format;
    unsigned long nitems, bytes_after;
    unsigned char *data = NULL;
    int result;

    result = XGetWindowProperty(
    disp, win, XInternAtom(disp, "_NET_FRAME_EXTENTS", False),
    0, 4, False, AnyPropertyType, 
    &actual_type, &actual_format, 
    &nitems, &bytes_after, &data);

    if (result == Success) {
        if ((nitems == 4) && (bytes_after == 0)) {
            tmpextents = (long *)data;
            extents = malloc(sizeof(long) * nitems);
            for (size_t i = 0; i < nitems; i++)
                extents[i] = tmpextents[i];
        }
        XFree(data);
    }
    return extents;
}

//_NET_WM_VISIBLE_NAME
char *get_window_visible_name(Display *disp, Window win) {
    char *net_wm_visible_name = NULL;
    char *wm_visible_name = NULL;
    char *visible_name = NULL;

    wm_visible_name = get_property(disp, win, XA_STRING, "WM_VISIBLE_NAME", NULL);
    net_wm_visible_name = get_property(disp, win, 
        XInternAtom(disp, "UTF8_STRING", False), "_NET_WM_VISIBLE_NAME", NULL);

    if (net_wm_visible_name) {
        visible_name = net_wm_visible_name;
    }else {
        if (wm_visible_name) {
            visible_name = strdup(wm_visible_name);
            free(wm_visible_name);
        }
        else {
            visible_name = NULL;
        }
    }

    return visible_name;
}

//_NET_WM_ICON_NAME
char *get_window_icon_name(Display *disp, Window win) {
    char *net_wm_icon_name = NULL;
    net_wm_icon_name = get_property(disp, win, 
        XInternAtom(disp, "UTF8_STRING", False), "_NET_WM_ICON_NAME", NULL);

    return net_wm_icon_name;
}

//_NET_WM_VISIBLE_ICON_NAME
char *get_window_visible_icon_name(Display *disp, Window win) {
    char *net_wm_visible_icon_name = NULL;
    net_wm_visible_icon_name = get_property(disp, win, 
        XInternAtom(disp, "UTF8_STRING", False), 
        "_NET_WM_VISIBLE_ICON_NAME", NULL);

    return net_wm_visible_icon_name;
}

struct geometry *get_window_geometry(Display *disp, Window win) {
    Window junkroot, child;
    int junkx,junky, abs_x, abs_y;
    unsigned int wwidth, wheight,  bw, depth;

    struct geometry *win_geometry = malloc(sizeof(struct geometry));
    if (!win_geometry)
        return NULL;

    XGetGeometry(disp, win, &junkroot, &junkx, &junky,
                        &wwidth, &wheight, &bw, &depth); // GET RELATIVES COORDINATES

    XTranslateCoordinates(disp, win, junkroot, junkx, junky,
                            &abs_x, &abs_y, &child); //GET ABSOLUTE COORDINATES

    win_geometry->width = wwidth;
    win_geometry->height = wheight;

    win_geometry->x = junkx;
    win_geometry->y = junky;

    win_geometry->abs_x = abs_x - junkx;
    win_geometry->abs_y = abs_y - junky;

    return win_geometry;
}

//_NET_WM_STRUT
Atom *get_window_net_wm_strut(Display *disp, Window win, size_t *size) {
    return (Atom *)get_property(disp, win, XA_CARDINAL, 
        "_NET_WM_STRUT", size);
}