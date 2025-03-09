#include "wmctrl-napi.hpp"

class GetByIdWorker : public AsyncWorker {
    public:
        GetByIdWorker(Napi::Env &env, Promise::Deferred deferred, Window id) 
            :AsyncWorker(env), deferred(deferred), id(id), wi(NULL), error(NULL) {}
        ~GetByIdWorker() {
            if (this->wi)
                free_window_info(this->wi);

            if (this->error)
                free(this->error);
        }

    void Execute() override {
        this->wi = create_window_info(NULL, this->id, &this->st);
    }

    void OnOK() override {
        Napi::Env env = Env();
        Object wi_js;
        String error_js;
        if (this->st != WINDOW_PROPERTY_GET) {
            this->error = get_error_message(this->st);
            error_js = String::New(env, this->error);
            this->deferred.Reject(error_js);
        } else {
            wi_js = create_window_js(env, this->wi);
            this->deferred.Resolve(wi_js);
        }
    }

    private:
        Promise::Deferred deferred;
        Window id;
        struct window_info *wi;
        char *error;
        enum STATES st;
};

Promise getWindowByIdAsync(const CallbackInfo &info) {
    checkId(info, "getWindowById");
    Env env = info.Env();

    int id = info[0].As<Number>();
    Promise::Deferred deferred = Promise::Deferred::New(env);
    GetByIdWorker *wk = new GetByIdWorker(env, deferred, (Window)id);
    wk->Queue();

    return deferred.Promise();
}

Value getWindowByIdSync(const CallbackInfo &info) {
    checkId(info, "getWindowByIdSync");
    Env env = info.Env();
    Object wi_js;
    int id = info[0].As<Number>();
    enum STATES st;
    struct window_info *wi;

    wi = create_window_info(NULL, id, &st);
    if (st != WINDOW_PROPERTY_GET) {
        handling_libwmctrl_error(env, "getWindowByIdSync", st);
        return Boolean::New(env, false);
    }

    wi_js = create_window_js(env, wi);
    free_window_info(wi);

    return wi_js;
}