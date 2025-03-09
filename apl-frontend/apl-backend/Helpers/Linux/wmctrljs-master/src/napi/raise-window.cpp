#include "wmctrl-napi.hpp"

class RaiseWorker : public AsyncWorker {
    public:
        RaiseWorker(Napi::Env &env, Promise::Deferred deferred, Window id) 
            :AsyncWorker(env), deferred(deferred), id(id), err(NULL) {

            }
        ~RaiseWorker() {
            if (this->err)
                free(this->err);
        }

    void Execute() override {
        this->st = window_raise(NULL, this->id);
    }

    void OnOK() override {
        Napi::Env env = Env();
        String err_js;

        if (this->st != WINDOW_RAISED) {
            this->err = get_libwmctrl_error("windowRaise", this->st);
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

Promise windowRaiseAsync(const CallbackInfo &info) {
    checkId(info, "windowRaise");
    Napi::Env env = info.Env();
    int id = info[0].As<Number>();

    Promise::Deferred deferred = Promise::Deferred(env);
    RaiseWorker *wk = new RaiseWorker(env, deferred, id);
    wk->Queue();
    return deferred.Promise();
}

Boolean windowRaiseSync(const CallbackInfo &info) {
    checkId(info, "windowRaiseSync");
    Napi::Env env = info.Env();
    int id = info[0].As<Number>();
    enum STATES st;

    st = window_raise(NULL, id);

    if (st != WINDOW_RAISED) {
        handling_libwmctrl_error(env, "windowRaiseSync", st);
        return Boolean::New(env, false);
    }

    return Boolean::New(env, true);
}