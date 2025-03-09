#include "../src/wmctrl.h"
#include <unistd.h>
#include <stdio.h>
#include <string.h>

void test_list_window(Display *disp) {
    struct window_list *wl = list_windows(disp, NULL);
    printf("Window number %ld\n", wl->client_list_size);
    for (int i = 0; i < wl->client_list_size; i++) {
        print_window_info(wl->client_list + i);
    }
    free_window_list(wl);
}

void debugend(char *test_name) {
    printf("\n------- %s ok\n\n", test_name);
}

struct codeInfos {
    clock_t begin;
    char *id;
};

struct codeInfos **times = NULL;
size_t size_times = 512;

void timer(char *str) {
    if (!times)
        times = calloc(sizeof(struct codeInfos *), size_times);

    int64_t call_time = clock();
    //CREATE IF NOT EXIST
    for (size_t i = 0; i < size_times; i++) {
        if (!times[i]) {
            times[i] = malloc(sizeof(struct codeInfos));
            if (!times[i])
                return;

            times[i]->id = strdup(str);
            times[i]->begin = call_time;
            break;
        }
    }
}

void timerEnd(char *str) {
    int64_t call_time = clock();
    for (size_t i = 0; i < size_times; i++) {
        if (times[i] && strcmp(times[i]->id, str) == 0) {
            double time_taken = ((double)(call_time - times[i]->begin))/1000;
            printf("%s: %fms\n", times[i]->id, time_taken);
            free(times[i]->id);
            free(times[i]);
            times[i] = NULL;
            break;
        }
    }
}

void wait_for_x11_server() {
    printf("Temperize for X11 server\n");
    sleep(1);
}

int main(int argc, char **argv) {
    if (init_wmctrl_lib()) {
        printf("wmctrl_lib initialised!\n");
    }
    else {
        printf("Can't initialise wmctrl_lib\n");
        return 1;
    }

    char *winProcess = "xclock";
    char *class_name = "wmctrlTest.out.XClock";//"xclock.XClock";
    enum STATES st;
    struct window_list *wl = NULL;
    Screen *sc = NULL;
    struct window_info *wi = NULL;

    for (size_t i = 0; i < 100; i++) {
        timer("closeWindowById");
        close_window_by_id(NULL, 4);
        timerEnd("closeWindowById");
    }
    wait_for_x11_server();

    for (size_t i = 0; i < 100; i++) {
        timer("getScreen");
        sc = get_screen(NULL, &st);
        timerEnd("getScreen");
        if (sc)
            free_screen(sc);
    }
    wait_for_x11_server();

    for (size_t i = 0; i < 100; i++) {
        timer("getWindowList");
        wl = list_windows(NULL, &st);
        free_window_list(wl);
        timerEnd("getWindowList");
    }
    wait_for_x11_server();

    for (size_t i = 0; i < 100; i++) {
        timer("closeWindowsByClassName");
        st = close_windows_by_class_name(NULL, class_name);
        timerEnd("closeWindowsByClassName");
        if (st != WINDOWS_CLOSED) {
            char *error = get_error_message(st);
            if (error) {
                printf("Voluntary error [Must failed] close of windows %s failed error:%s\n", class_name, error);
                free(error);
                if (st != NO_WINDOW_FOUND)
                    return 1;
            }
            else
                printf("close of windows %s failed error:Unexpected\n", class_name);
        }
    }

    wait_for_x11_server();

    for (int i = 0; i < 50; i++) {
        if (fork() == 0) {
            execvp(winProcess, argv);
            return 1;
        } else {
            usleep(1000 * 100);
        }
    }
    sleep(5);

    timer("getWindowsByClassName");
    wl = get_windows_by_class_name(class_name, &st);
    timerEnd("getWindowsByClassName");
    if (!wl) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    printf("%ld windows are open with the class_name %s\n", wl->client_list_size, class_name);

    timer("activeWindowsByClassName");
    st = active_windows_by_class_name(NULL, class_name);
    timerEnd("activeWindowsByClassName");
    if (st != WINDOWS_ACTIVATED) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
    }
    wait_for_x11_server();
    sleep(1);

    for (size_t i = 0; i < wl->client_list_size; i++) {
        wi = wl->client_list + i;
        timer("closeWindowsByPid");
        st = close_windows_by_pid(NULL, wi->win_pid);
        timerEnd("closeWindowsByPid");
        usleep(100 * 1000);
    }
    wait_for_x11_server();

    timer("closeWindowsByClassName");
    st = close_windows_by_class_name(NULL, class_name);
    timerEnd("closeWindowsByClassName");
    if (st != WINDOWS_CLOSED) {
        char *error = get_error_message(st);
        if (error) {
            printf("Voluntary error [Must failed] %s\n", error);
            free(error);
        }
    }
    free_window_list(wl);
    wait_for_x11_server();

    for (size_t i = 0; i < 100; i++) {
        timer("getActiveWindow");
        wi = get_active_window(&st);
        timerEnd("getActiveWindow");
        char *error = get_error_message(st);
        if (!error) {
            printf("CAN_NOT_ALOCATE MEMORY\n");
            return 1;
        }
        if (st == NO_WINDOW_ACTIVE_FOR_NOW)
            printf("Voluntary error [Must failed] %s\n", error);
        else if (st != NO_WINDOW_ACTIVE_FOR_NOW) {
            printf("Unexpected error %s", error);
            free(error);
            free_window_info(wi);
            return 1;
        }
        free(error);
        free_window_info(wi);
    }

    if (fork() == 0) {
        execvp("xeyes", argv);
        return 1;
    }
    sleep(2);

    for (size_t i = 0; i < 100; i++) {
        timer("activeWindowsByClassName");
        active_windows_by_class_name(NULL, "wmctrlTest.out.XEyes");
        timerEnd("activeWindowsByClassName");
    }

    wait_for_x11_server();

    for (size_t i = 0; i < 100; i++) {
        timer("getActiveWindow");
        wi = get_active_window(&st);
        timerEnd("getActiveWindow");
        if (st != CLIENT_LIST_GET) {
            char *error = get_error_message(st);
            if (error) {
                printf("%s\n", error);
                free(error);
            }
        }
        free_window_info(wi);
    }

    wait_for_x11_server();

    timer("getWindowsByClassName");
    wl = get_windows_by_class_name("wmctrlTest.out.XEyes", &st);
    timerEnd("getWindowsByClassName");
    if (!wl || st != CLIENT_LIST_GET) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }

    wait_for_x11_server();
 
    wi = wl->client_list;
    timer("windowMoveResize");
    st = window_move_resize(NULL, wi->win_id, 0, 0, 0, 500, 500);
    timerEnd("windowMoveResize");
    if (st != WINDOW_MOVED_RESIZED) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    sleep(2);

    timer("windowMoveResize");
    st = window_move_resize(NULL, wi->win_id, 0, 0, 0, 1000, 1000);
    timerEnd("windowMoveResize");
    if (st != WINDOW_MOVED_RESIZED) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    wait_for_x11_server();

    timer("windowState");
    st = window_state(NULL, wi->win_id, _NET_WM_STATE_ADD, "maximized_vert", "maximized_horz");
    timerEnd("windowState");
    if (st != WINDOW_STATE_SET) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    wait_for_x11_server();

    timer("windowState");
    st = window_state(NULL, wi->win_id, _NET_WM_STATE_REMOVE, "maximized_vert", "maximized_horz");
    timerEnd("windowState");
    if (st != WINDOW_STATE_SET) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    wait_for_x11_server();

    timer("windowState");
    st = window_state(NULL, wi->win_id, _NET_WM_STATE_ADD, "fullscreen", NULL);
    timerEnd("windowState");
    if (st != WINDOW_STATE_SET) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    wait_for_x11_server();

    timer("windowState");
    st = window_state(NULL, wi->win_id, _NET_WM_STATE_REMOVE, "fullscreen", NULL);
    timerEnd("windowState");
    if (st != WINDOW_STATE_SET) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    wait_for_x11_server();

    timer("windowMinimize");
    st = window_minimize(NULL, wi->win_id);
    timerEnd("windowMinimize");
    if (st != WINDOW_MINIMIZED) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    wait_for_x11_server();

    timer("activeWindowById");
    st = active_window_by_id(NULL, wi->win_id);
    timerEnd("activeWindowById");
    if (st != WINDOW_ACTIVATED) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    wait_for_x11_server();

    timer("windowState");
    st = window_state(NULL, wi->win_id, _NET_WM_STATE_ADD, "fullscreen", NULL);
    timerEnd("windowState");
    if (st != WINDOW_STATE_SET) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    wait_for_x11_server();

    free_window_list(wl);

    timer("closeWindowsByClassName");
    st = close_windows_by_class_name(NULL, "wmctrlTest.out.XEyes");
    timerEnd("closeWindowsByClassName");
    if (st != WINDOWS_CLOSED) {
        char *error = get_error_message(st);
        if (error) {
            printf("%s\n", error);
            free(error);
        }
        return 1;
    }
    wait_for_x11_server();

    if (fork() == 0) {
        execvp("firefox", argv);
        return 1;
    }
    sleep(5);

    wl = get_windows_by_class_name("Navigator.Firefox", NULL);
    if (!wl) {
        printf("No window found\n");
        return 1;
    }

    wi = wl->client_list + wl->client_list_size -1;

    timer("windowAllowAllSizes");
    window_allow_all_sizes(NULL, wi->win_id);
    timerEnd("windowAllowAllSizes");
    free_window_list(wl);

    wl = get_windows_by_class_name("Navigator.Firefox", NULL); //Refresh window list
    wi = wl->client_list + wl->client_list_size -1;
    if (!(wi->WM_NORMAL_HINTS->max_width == 0 &&
        wi->WM_NORMAL_HINTS->max_height == 0 &&
        wi->WM_NORMAL_HINTS->min_width == 0 &&
        wi->WM_NORMAL_HINTS->min_height == 0)) {
            printf("window_allow_all_sizes failed\n");
            return 1;
        }
    close_window_by_id(NULL, wi->win_id);
    free_window_list(wl);

    printf("ALL TEST ENDED WITH SUCESS\n");
    printf("DONE!\n");
    return 0;
}