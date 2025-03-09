#include "./wmctrl-napi.hpp"


class GetWindowListWorker : public AsyncWorker {
    public:
        GetWindowListWorker(Napi::Env &env, Promise::Deferred deferred) 
            : AsyncWorker(env), deferred(deferred), wl(NULL), err(NULL) {}
        ~GetWindowListWorker() {
            if (this->wl) {
                free_window_list(this->wl);
            }

            if (this->err) {
                free(this->err);
            }
        }

    void Execute() override {
        this->wl = list_windows(NULL, &this->st);
    }

    void OnOK() override {
        Napi::Env env = Env();
        String err_js;
        Array windows_js;
        struct window_info *wi;

        if (this->st != CLIENT_LIST_GET) {
            this->err = get_error_message(this->st);
            if (this->err) {
                err_js = String::New(env, "Memory alloc failed");
            } else {
                err_js = String::New(env, this->err);
            }
            this->deferred.Reject(err_js);
        } else {
            if (this->wl) {
                windows_js = Array::New(env, this->wl->client_list_size);

                for (size_t i = 0; i < this->wl->client_list_size; i++) {
                    wi = this->wl->client_list + i;
                    windows_js[i] = create_window_js(env, wi);
                }

                this->deferred.Resolve(windows_js);
            } else {
                this->deferred.Reject(String::New(env, "Memory alloc failed"));
            }
        }
    }

    private:
        Promise::Deferred deferred;
        struct window_list *wl;
        char *err;
        enum STATES st;
};

Promise getWindowListAsync(const CallbackInfo &info) {
    Napi::Env env = info.Env();
    Promise::Deferred deferred = Promise::Deferred::New(env);
    GetWindowListWorker *wk = new GetWindowListWorker(env, deferred);
    wk->Queue();
    return deferred.Promise();
}

Value getWindowListSync(const CallbackInfo &info) {
    Napi::Env env = info.Env();
    Array windows_js;
    enum STATES st;
    struct window_info *wi;
    struct window_list *wl = list_windows(NULL, &st);

    if (st != CLIENT_LIST_GET) {
        handling_libwmctrl_error(env, "getWindowListSync", st);
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