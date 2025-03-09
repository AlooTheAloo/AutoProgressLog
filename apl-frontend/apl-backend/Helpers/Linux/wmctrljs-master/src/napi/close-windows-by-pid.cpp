#include "wmctrl-napi.hpp"

using namespace Napi;

class CloseByPidWorker : public AsyncWorker {
    public:
        CloseByPidWorker(Napi::Env &env, Promise::Deferred deferred, Window win_pid)
        : AsyncWorker(env), deferred(deferred), win_pid(win_pid) {}
        ~CloseByPidWorker() {}

    void Execute() override {
        st = close_windows_by_pid(NULL, win_pid);
    }

    void OnOK() override {
        Napi::Env env = Env();
        char *err;
        String err_js;

        if (this->st != WINDOWS_CLOSED) {
            err = get_libwmctrl_error("closeWindowsByPid", st);
            err_js = String::New(env, err);
            free(err);
            this->deferred.Reject(err_js);
        }else {
            this->deferred.Resolve(Boolean::New(env, true));
        }
    }

    private:
        Promise::Deferred deferred;
        Window win_pid;
        enum STATES st;
};

Boolean closeWindowsByPidSync(const CallbackInfo &info) {
    checkPid(info, "closeWindowsByPidSync");
    Env env = info.Env();
    int32_t win_pid = info[0].As<Number>().Int32Value();
    enum STATES st = close_windows_by_pid(NULL, win_pid);

    if (st != WINDOWS_ACTIVATED) {
        handling_libwmctrl_error(env, "closeWindowsByPidSync", st);
        return Boolean::New(env, false);
    }

    return Boolean::New(env, true);    
}

Promise closeWindowsByPidAsync(const CallbackInfo &info) {
    checkPid(info, "closeWindowsByPid");
    Napi::Env env = info.Env();
    int32_t win_pid = info[0].As<Number>().Int32Value();

    Promise::Deferred deferred = Promise::Deferred::New(env);
    CloseByPidWorker *wk = new CloseByPidWorker(env, deferred, win_pid);
    wk->Queue();
    return deferred.Promise();
}