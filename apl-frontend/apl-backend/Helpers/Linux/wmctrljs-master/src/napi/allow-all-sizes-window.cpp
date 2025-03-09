#include "wmctrl-napi.hpp"

class AllowAllSizesWorker : public AsyncWorker {
    public:
        AllowAllSizesWorker(Napi::Env &env, Promise::Deferred deferred, Window id) 
            :AsyncWorker(env), deferred(deferred), id(id), err(NULL) {

            }
        ~AllowAllSizesWorker() {
            if (this->err)
                free(this->err);
        }

    void Execute() override {
        this->st = window_allow_all_sizes(NULL, this->id);
    }

    void OnOK() override {
        Napi::Env env = Env();
        String err_js;

        if (this->st != WINDOW_ALLOWED_ALL_SIZE) {
            this->err = get_libwmctrl_error("windowAllowAllSizes", this->st);
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

Promise windowAllowAllSizesAsync(const CallbackInfo &info) {
    checkId(info, "windowAllowAllSizes");
    Napi::Env env = info.Env();
    int id = info[0].As<Number>();

    Promise::Deferred deferred = Promise::Deferred(env);
    AllowAllSizesWorker *wk = new AllowAllSizesWorker(env, deferred, id);
    wk->Queue();
    return deferred.Promise();
}

Boolean windowAllowAllSizesSync(const CallbackInfo &info) {
    checkId(info, "windowAllowAllSizesSync");
    Napi::Env env = info.Env();
    int id = info[0].As<Number>();
    enum STATES st = window_allow_all_sizes(NULL, id);

    if (st != WINDOW_ALLOWED_ALL_SIZE) {
        handling_libwmctrl_error(env, "windowAllowAllSizesSync", st);
        return Boolean::New(env, false);
    }

    return Boolean::New(env, true);
}