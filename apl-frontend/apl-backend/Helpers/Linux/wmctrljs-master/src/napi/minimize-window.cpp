#include "wmctrl-napi.hpp"

class MinimizeWorker : public AsyncWorker {
    public:
        MinimizeWorker(Napi::Env &env, Promise::Deferred deferred, Window id) 
            :AsyncWorker(env), deferred(deferred), id(id), err(NULL) {}
        ~MinimizeWorker() {
            if (this->err)
                free(this->err);
        }

    void Execute() override {
        this->st = window_minimize(NULL, this->id);
    }

    void OnOK() override {
        Napi::Env env = Env();
        String err_js;

        if (this->st != WINDOW_MINIMIZED) {
            this->err = get_libwmctrl_error("windowMinimize", this->st);
            this->deferred.Reject(err_js);
        } else {
            this->deferred.Resolve(Boolean::New(env, true));
        }
    }

    private:
        Promise::Deferred deferred;
        Window id;
        char *err;
        enum STATES st;
};

Promise windowMinimizeAsync(const CallbackInfo &info) {
    checkId(info, "windowMinimize");
    Napi::Env env = info.Env();
    int id = info[0].As<Number>();

    Promise::Deferred deferred = Promise::Deferred(env);
    MinimizeWorker *wk = new MinimizeWorker(env, deferred, id);
    wk->Queue();
    return deferred.Promise();
}

Boolean windowMinimizeSync(const CallbackInfo &info) {
    checkId(info, "windowMinimizeSync");
    Napi::Env env = info.Env();
    int id = info[0].As<Number>();
    enum STATES st;

    st = window_minimize(NULL, id);

    if (st != WINDOW_MINIMIZED) {
        handling_libwmctrl_error(env, "windowMinimizeSync", st);
        return Boolean::New(env, false);
    }

    return Boolean::New(env, true);
}