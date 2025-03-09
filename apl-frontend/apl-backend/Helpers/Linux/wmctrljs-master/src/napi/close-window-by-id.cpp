#include "wmctrl-napi.hpp"

using namespace Napi;

class CloseByIdWorker : public AsyncWorker {
    public:
        CloseByIdWorker(Napi::Env env, Promise::Deferred deferred, Window win_id)
        : AsyncWorker(env), deferred(deferred), win_id(win_id), err(NULL) {}
        ~CloseByIdWorker() {
            if (this->err)
                free(err);
        }

    void Execute() override {
        st = close_window_by_id(NULL, win_id);
    }

    void OnOK() override {
        Napi::Env env = Env();
        String err_js;

        if (st != WINDOW_CLOSED) {
            this->err = get_libwmctrl_error("closeWindowById", st);
            err_js = String::New(env, err);
            this->deferred.Reject(err_js);
        }else {
            this->deferred.Resolve(Boolean::New(env, true));
        }
    }

    private:
        Promise::Deferred deferred;
        Window win_id;
        char *err;
        enum STATES st;
};

Boolean closeWindowByIdSync(const CallbackInfo &info) {
    checkId(info, "closeWindowById");
    Env env = info.Env();
    int32_t win_id = info[0].As<Number>().Int32Value();
    enum STATES st = close_window_by_id(NULL, win_id);

    if (st != WINDOW_CLOSED) {
        handling_libwmctrl_error(env, "closeWindowByIdSync", st);
        return Boolean::New(env, false);
    }
    return Boolean::New(env, true);
}

Promise closeWindowByIdAsync(const CallbackInfo &info) {
    checkId(info, "closeWindowById");
    Env env = info.Env();
    int32_t win_id = info[0].As<Number>().Int32Value();
    Promise::Deferred deferred = Promise::Deferred::New(env);
    CloseByIdWorker *wk = new CloseByIdWorker(env, deferred, win_id);
    wk->Queue();
    return deferred.Promise();
}