#include "wmctrl-napi.hpp"

using namespace Napi;

class ActiveByIdWorker : public AsyncWorker {
    public:
        ActiveByIdWorker(Napi::Env &env, Promise::Deferred deferred, Window win_id)
        : AsyncWorker(env), deferred(deferred), win_id(win_id), err(NULL) {}
        ~ActiveByIdWorker() {
            if (this->err)
                free(this->err);
        }

    void Execute() override {
        st = active_window_by_id(NULL, win_id);
    }

    void OnOK() override {
        Napi::Env env = Env();
        String err_js;

        if (st != WINDOW_ACTIVATED) {
            this->err = get_libwmctrl_error("activeWindowById", st);
            err_js = String::New(env, this->err);
            this->deferred.Reject(err_js);
        } else {
            this->deferred.Resolve(Boolean::New(env, true));
        }
    }

    private:
        Promise::Deferred deferred;
        Window win_id;
        char *err;
        enum STATES st;
};

Boolean activeWindowByIdSync(const CallbackInfo &info) {
    checkId(info, "activeWindowByIdSync");
    Env env = info.Env();
    int32_t win_id = info[0].As<Number>().Int32Value();
    enum STATES st = active_window_by_id(NULL, win_id);

    if (st != WINDOW_ACTIVATED) {
        handling_libwmctrl_error(env, "activeWindowByIdSync", st);
        return Boolean::New(env, false);
    }
    return Boolean::New(env, true);
}

Promise activeWindowByIdAsync(const CallbackInfo &info) {
    checkId(info, "activeWindowByIdAsync");
    Napi::Env env = info.Env();
    int32_t win_id = info[0].As<Number>().Int32Value();
    Promise::Deferred deferred = Promise::Deferred::New(env);
    ActiveByIdWorker *wk = new ActiveByIdWorker(env, deferred, win_id);
    wk->Queue();
    return deferred.Promise();
}