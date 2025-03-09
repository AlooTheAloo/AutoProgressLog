#include "wmctrl-napi.hpp"

using namespace Napi;

class ActiveByPidWorker : public AsyncWorker {
    public:
        ActiveByPidWorker(Napi::Env &env, Promise::Deferred deferred, Window win_pid)
        : AsyncWorker(env), deferred(deferred), win_pid(win_pid), err(NULL) {}
        ~ActiveByPidWorker() {
            if (this->err)
                free(err);
        }

    void Execute() override {
        st = active_windows_by_pid(NULL, win_pid);
    }

    void OnOK() override {
        Napi::Env env = Env();
        String err_js;

        if (this->st != WINDOWS_ACTIVATED) {
            this->err = get_libwmctrl_error("activeWindowsByPid", this->st);
            err_js = String::New(env, this->err);
            this->deferred.Reject(err_js);
        }else {
            this->deferred.Resolve(Boolean::New(env, true));
        }
    }

    private:
        Promise::Deferred deferred;
        Window win_pid;
        char *err;
        enum STATES st;
};

Boolean activeWindowsByPidSync(const CallbackInfo &info) {
    checkPid(info, "activeWindowsByPidSync");
    Env env = info.Env();
    int32_t win_pid = info[0].As<Number>().Int32Value();
    enum STATES st = active_windows_by_pid(NULL, win_pid);

    if (st != WINDOWS_ACTIVATED) {
        handling_libwmctrl_error(env, "activeWindowsByPidSync", st);
        return Boolean::New(env, false);
    }
    return Boolean::New(env, true);
}

Promise activeWindowsByPidAsync(const CallbackInfo &info) {
    checkPid(info, "activeWindowsByPid");
    Env env = info.Env();
    int32_t win_pid = info[0].As<Number>().Int32Value(); 

    Promise::Deferred deferred = Promise::Deferred(env);
    ActiveByPidWorker *wk = new ActiveByPidWorker(env, deferred, win_pid);
    wk->Queue();
    return deferred.Promise();
}