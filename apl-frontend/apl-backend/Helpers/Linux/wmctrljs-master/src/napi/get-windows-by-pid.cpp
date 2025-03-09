#include "./wmctrl-napi.hpp"

class GetWindowsByPid : public AsyncWorker {
    public:
        GetWindowsByPid(Napi::Env &env, Promise::Deferred deferred, unsigned long pid) 
        : AsyncWorker(env), deferred(deferred), pid(pid), wl(NULL), err(NULL) {}
        ~GetWindowsByPid() {
            if (this->wl)
                free_window_list(this->wl);

            if (this->err)
                free(this->err);
        }

    void Execute() override {
        this->wl = get_windows_by_pid(NULL, this->pid, &this->st);
    }

    void OnOK() override {
        Napi::Env env = Env();
        Array windows_js;
        String err_js;
        struct window_info *wi;

        if (this->st != CLIENT_LIST_GET) {
            this->err = get_libwmctrl_error("getWindowByClassName", this->st);
            err_js = String::New(env, this->err);
            this->deferred.Reject(err_js);
        } else {
            windows_js = Array::New(env, this->wl->client_list_size);
            for (size_t i = 0; i < this->wl->client_list_size; i++) {
                wi = this->wl->client_list + i;
                windows_js[i] = create_window_js(env, wi);
            }
            this->deferred.Resolve(windows_js);
        }
    }

    private:
        Promise::Deferred deferred;
        unsigned long pid;
        struct window_list *wl;
        char *err;
        enum STATES st;
};

Promise getWindowsByPidAsync(const CallbackInfo &info) {
    checkPid(info, "getWindowsByPidAsync");
    Napi::Env env = info.Env();
    unsigned int pid = info[0].As<Number>();

    Promise::Deferred deferred = Promise::Deferred::New(env);
    GetWindowsByPid *wk = new GetWindowsByPid(env, deferred, pid);
    wk->Queue();

    return deferred.Promise();
}

Value getWindowsByPidSync(const CallbackInfo &info) {
    checkPid(info, "getWindowsByPidSync");
    Napi::Env env = info.Env();
    Array windows_js;
    unsigned int pid = info[0].As<Number>();
    enum STATES st;
    struct window_list *wl;
    struct window_info *wi;

    wl = get_windows_by_pid(NULL, pid, &st);
    if (st !=  CLIENT_LIST_GET) {
        handling_libwmctrl_error(env, "getWindowsByPidSync", st);
        return env.Null();
    }

    windows_js = Array::New(env, wl->client_list_size);
    for (size_t i = 0; i < wl->client_list_size; i++) {
        wi = wl->client_list + i;
        windows_js[i] = create_window_js(env, wi);
    }

    free_window_list(wl);
    return windows_js;
}