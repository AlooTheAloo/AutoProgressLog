#include "./wmctrl.h"

/**
 * state = 1 ON
 * state = 0 OFF
 * **/
int showing_desktop (Display *disp, unsigned long state) {
    return client_msg(disp, DefaultRootWindow(disp), "_NET_SHOWING_DESKTOP", 
        state, 0, 0, 0, 0);
}

//_NET_CURRENT_DESKTOP
int switch_desktop (Display *disp, unsigned long target) {   
    return client_msg(disp, DefaultRootWindow(disp), "_NET_CURRENT_DESKTOP", target, 0, 0, 0, 0);
}
/*
static int longest_str (gchar **strv) {
    size_t max = 0;
    size_t i = 0;
    
    while (strv && strv[i]) {
        if (strlen(strv[i]) > max) {
            max = strlen(strv[i]);
        }
        i++;
    }

    return max;
}*/

//_NET_NUMBER_OF_DESKTOPS
int change_number_of_desktops (Display *disp, unsigned long n) {
    return client_msg(disp, DefaultRootWindow(disp), "_NET_NUMBER_OF_DESKTOPS", 
        n, 0, 0, 0, 0);
}
/*
int list_desktops (Display *disp) {
    unsigned long *num_desktops = NULL;
    unsigned long *cur_desktop = NULL;
    unsigned long desktop_list_size = 0;
    unsigned long *desktop_geometry = NULL;
    unsigned long desktop_geometry_size = 0;
    gchar **desktop_geometry_str = NULL;
    unsigned long *desktop_viewport = NULL;
    unsigned long desktop_viewport_size = 0;
    gchar **desktop_viewport_str = NULL;
    unsigned long *desktop_workarea = NULL;
    unsigned long desktop_workarea_size = 0;
    gchar **desktop_workarea_str = NULL;
    gchar *list = NULL;
    unsigned long i;
    unsigned long id;
    Window root = DefaultRootWindow(disp);
    int ret = EXIT_FAILURE;
    gchar **names = NULL;
    
    if (! (num_desktops = (unsigned long *)get_property(disp, root,
            XA_CARDINAL, "_NET_NUMBER_OF_DESKTOPS", NULL))) {
        if (! (num_desktops = (unsigned long *)get_property(disp, root,
                XA_CARDINAL, "_WIN_WORKSPACE_COUNT", NULL))) {
            fputs("Cannot get number of desktops properties. "
                  "(_NET_NUMBER_OF_DESKTOPS or _WIN_WORKSPACE_COUNT)"
                  "\n", stderr);
            goto cleanup;
        }
    }
    
    if (! (cur_desktop = (unsigned long *)get_property(disp, root,
            XA_CARDINAL, "_NET_CURRENT_DESKTOP", NULL))) {
        if (! (cur_desktop = (unsigned long *)get_property(disp, root,
                XA_CARDINAL, "_WIN_WORKSPACE", NULL))) {
            fputs("Cannot get current desktop properties. "
                  "(_NET_CURRENT_DESKTOP or _WIN_WORKSPACE property)"
                  "\n", stderr);
            goto cleanup;
        }
    }

    if ((list = get_property(disp, root, 
            XInternAtom(disp, "UTF8_STRING", False), 
            "_NET_DESKTOP_NAMES", &desktop_list_size)) == NULL) {
        if ((list = get_property(disp, root, 
            XA_STRING, 
            "_WIN_WORKSPACE_NAMES", &desktop_list_size)) == NULL) {
            printf("Cannot get desktop names properties. "
                  "(_NET_DESKTOP_NAMES or _WIN_WORKSPACE_NAMES)"
                  "\n");
            // ignore the error - list the desktops without names 
        }
    }
 
    // common size of all desktops 
    if (! (desktop_geometry = (unsigned long *)get_property(disp, DefaultRootWindow(disp),
                    XA_CARDINAL, "_NET_DESKTOP_GEOMETRY", &desktop_geometry_size))) {
        printf("Cannot get common size of all desktops (_NET_DESKTOP_GEOMETRY).\n");
    }
     
    // desktop viewport 
    if (! (desktop_viewport = (unsigned long *)get_property(disp, DefaultRootWindow(disp),
                    XA_CARDINAL, "_NET_DESKTOP_VIEWPORT", &desktop_viewport_size))) {
        printf("Cannot get common size of all desktops (_NET_DESKTOP_VIEWPORT).\n");
    }
     
    // desktop workarea 
    if (! (desktop_workarea = (unsigned long *)get_property(disp, DefaultRootWindow(disp),
                    XA_CARDINAL, "_NET_WORKAREA", &desktop_workarea_size))) {
        if (! (desktop_workarea = (unsigned long *)get_property(disp, DefaultRootWindow(disp),
                        XA_CARDINAL, "_WIN_WORKAREA", &desktop_workarea_size))) {
            printf("Cannot get _NET_WORKAREA property.\n");
        }
    }
     
    // prepare the array of desktop names
    names = g_malloc0(*num_desktops * sizeof(char *));
    if (list) {
        id = 0;
        names[id++] = list;
        for (i = 0; i < desktop_list_size; i++) {
            if (list[i] == '\0') {
                if (id >= *num_desktops) {
                    break;
                }
                names[id++] = list + i + 1;
            }
        }
    }

    // prepare desktop geometry strings 
    desktop_geometry_str = g_malloc0((*num_desktops + 1) * sizeof(char *));
    if (desktop_geometry && desktop_geometry_size > 0) {
        if (desktop_geometry_size == 2 * sizeof(*desktop_geometry)) {
            // only one value - use it for all desktops
            printf("WM provides _NET_DESKTOP_GEOMETRY value common for all desktops.\n");
            for (i = 0; i < *num_desktops; i++) {
                desktop_geometry_str[i] = g_strdup_printf("%lux%lu", 
                desktop_geometry[0], desktop_geometry[1]);
            }
        }
        else {
            // seperate values for desktops of different size
            printf("WM provides separate _NET_DESKTOP_GEOMETRY value for each desktop.\n");
            for (i = 0; i < *num_desktops; i++) {
                if (i < desktop_geometry_size / sizeof(*desktop_geometry) / 2) {
                    desktop_geometry_str[i] = g_strdup_printf("%lux%lu", 
                        desktop_geometry[i*2], desktop_geometry[i*2+1]);
                }
                else {
                    desktop_geometry_str[i] = g_strdup("N/A");
                }
            }
        }
    }
    else {
        for (i = 0; i < *num_desktops; i++) {
            desktop_geometry_str[i] = g_strdup("N/A");
        }
    }
 
    // prepare desktop viewport strings 
    desktop_viewport_str = g_malloc0((*num_desktops + 1) * sizeof(char *));
    if (desktop_viewport && desktop_viewport_size > 0) {
        if (desktop_viewport_size == 2 * sizeof(*desktop_viewport)) {
            // only one value - use it for current desktop
            printf("WM provides _NET_DESKTOP_VIEWPORT value only for the current desktop.\n");
            for (i = 0; i < *num_desktops; i++) {
                if (i == *cur_desktop) {
                    desktop_viewport_str[i] = g_strdup_printf("%lu,%lu", 
                        desktop_viewport[0], desktop_viewport[1]);
                }
                else {
                    desktop_viewport_str[i] = g_strdup("N/A");
                }
            }
        }
        else {
            // seperate values for each of desktops
            for (i = 0; i < *num_desktops; i++) {
                if (i < desktop_viewport_size / sizeof(*desktop_viewport) / 2) {
                    desktop_viewport_str[i] = g_strdup_printf("%lu,%lu", 
                        desktop_viewport[i*2], desktop_viewport[i*2+1]);
                }
                else {
                    desktop_viewport_str[i] = g_strdup("N/A");
                }
            }
        }
    }
    else {
        for (i = 0; i < *num_desktops; i++) {
            desktop_viewport_str[i] = g_strdup("N/A");
        }
    }
 
    // prepare desktop workarea strings
    desktop_workarea_str = g_malloc0((*num_desktops + 1) * sizeof(char *));
    if (desktop_workarea && desktop_workarea_size > 0) {
        if (desktop_workarea_size == 4 * sizeof(*desktop_workarea)) {
            // only one value - use it for current desktop 
            printf("WM provides _NET_WORKAREA value only for the current desktop.\n");
            for (i = 0; i < *num_desktops; i++) {
                if (i == *cur_desktop) {
                    desktop_workarea_str[i] = g_strdup_printf("%lu,%lu %lux%lu", 
                        desktop_workarea[0], desktop_workarea[1],
                        desktop_workarea[2], desktop_workarea[3]);
                }
                else {
                    desktop_workarea_str[i] = g_strdup("N/A");
                }
            }
        }
        else {
            // seperate values for each of desktops
            for (i = 0; i < *num_desktops; i++) {
                if (i < desktop_workarea_size / sizeof(*desktop_workarea) / 4) {
                    desktop_workarea_str[i] = g_strdup_printf("%lu,%lu %lux%lu", 
                        desktop_workarea[i*4], desktop_workarea[i*4+1],
                        desktop_workarea[i*4+2], desktop_workarea[i*4+3]);
                }
                else {
                    desktop_workarea_str[i] = g_strdup("N/A");
                }
            }
        }
    }
    else {
        for (i = 0; i < *num_desktops; i++) {
            desktop_workarea_str[i] = g_strdup("N/A");
        }
    }
 
    // print the list
    for (i = 0; i < *num_desktops; i++) {
        gchar *out = get_output_str(names[i]);
        printf("%-2d %c DG: %-*s  VP: %-*s  WA: %-*s  %s\n", i, i == *cur_desktop ? '*' : '-',
                longest_str(desktop_geometry_str), desktop_geometry_str[i], 
                longest_str(desktop_viewport_str), desktop_viewport_str[i], 
                longest_str(desktop_workarea_str), desktop_workarea_str[i], 
                out ? out : "N/A");
        g_free(out);
    }
    
    printf("Total number of desktops: %lu\n", *num_desktops);
    printf("Current desktop ID (counted from zero): %lu\n", *cur_desktop);
    
    ret = EXIT_SUCCESS;
    goto cleanup;
    
cleanup:
    g_free(names);
    g_free(num_desktops);
    g_free(cur_desktop);
    g_free(desktop_geometry);
    g_strfreev(desktop_geometry_str);
    g_free(desktop_viewport);
    g_strfreev(desktop_viewport_str);
    g_free(desktop_workarea);
    g_strfreev(desktop_workarea_str);
    g_free(list);
    
    return ret;
}*/