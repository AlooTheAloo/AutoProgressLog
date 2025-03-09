#include "./wmctrl-napi.hpp"

class GetWindowsByClassName : public AsyncWorker {
    public:
        GetWindowsByClassName(Napi::Env &env, Promise::Deferred deferred, const char *class_name) 
        : AsyncWorker(env), deferred(deferred), class_name(strdup(class_name)), wl(NULL), err(NULL) {}
        ~GetWindowsByClassName() {
            if (this->class_name)
                free(this->class_name);

            if (this->wl)
                free_window_list(this->wl);

            if (this->err)
                free(this->err);
        }

    void Execute() override {
        if (this->class_name)
            this->wl = get_windows_by_class_name(NULL, this->class_name, &this->st);
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
        char *class_name;
        struct window_list *wl;
        char *err;
        enum STATES st;
};

Promise getWindowsByClassNameAsync(const CallbackInfo &info) {
    checkClassName(info, "getWindowsByClassNameAsync");
    Napi::Env env = info.Env();
    std::string class_name = info[0].As<String>().Utf8Value();

    Promise::Deferred deferred = Promise::Deferred::New(env);
    GetWindowsByClassName *wk = new GetWindowsByClassName(env, deferred, class_name.c_str());
    wk->Queue();

    return deferred.Promise();
}

Value getWindowsByClassNameSync(const CallbackInfo &info) {
    checkClassName(info, "getWindowsByClassNameSync");
    Napi::Env env = info.Env();
    std::string class_name = info[0].As<String>().Utf8Value();
    Array windows_js;
    enum STATES st;
    struct window_list *wl;
    struct window_info *wi;

    wl = get_windows_by_class_name(NULL, (char *)class_name.c_str(), &st);
    if (st !=  CLIENT_LIST_GET) {
        handling_libwmctrl_error(env, "getWindowsByClassNameSync", st);
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