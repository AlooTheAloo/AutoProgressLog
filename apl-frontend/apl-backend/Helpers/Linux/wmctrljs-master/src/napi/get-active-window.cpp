#include "./wmctrl-napi.hpp"

class GetActiveWindowWorker : public AsyncWorker {
    public:
        GetActiveWindowWorker(Napi::Env &env, Promise::Deferred deferred) 
            : AsyncWorker(env), deferred(deferred), wi(NULL), err(NULL) {}
        ~GetActiveWindowWorker() {
            if (this->wi)
                free_window_info(this->wi);

            if (this->err)
                free(this->err);
        }

    void Execute() override {
        this->wi = get_active_window(NULL, &this->st);
    }

    void OnOK() override {
        Napi::Env env = Env();
        Object window_js;        
        String err_js;

        if (this->st != CLIENT_LIST_GET) {
            this->err = get_error_message(this->st);
            err_js = String::New(env, this->err);
            this->deferred.Reject(err_js);
        }
        else {
            window_js = create_window_js(env, wi);
            free_window_info(wi);
            this->deferred.Resolve(window_js);
        }
    }

    private:
        Promise::Deferred deferred;
        struct window_info *wi;
        char *err;
        enum STATES st;
};

Promise getActiveWindowAsync(const CallbackInfo &info) {
    Env env = info.Env();
    Promise::Deferred deferred = Promise::Deferred::New(env);
    GetActiveWindowWorker *wk = new GetActiveWindowWorker(env, deferred);
    wk->Queue();
    return deferred.Promise();
}

Value getActiveWindowSync(const CallbackInfo &info) {
    Env env = info.Env();
    Object window_js;
    enum STATES st;
    struct window_info *wi = get_active_window(NULL, &st);

    if (!wi || st != CLIENT_LIST_GET) {
        handling_libwmctrl_error(env, "getActiveWindowSync", st);
        return env.Null();
    }

    window_js = create_window_js(env, wi);
    free_window_info(wi);
    return window_js;
}