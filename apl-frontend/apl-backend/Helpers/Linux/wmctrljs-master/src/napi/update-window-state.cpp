#include "./wmctrl-napi.hpp"

class UpdateStateWorker: public AsyncWorker {
    public:
        UpdateStateWorker(Napi::Env &env, Promise::Deferred deferred, Window win, unsigned long action, char *p1, char *p2)
            :AsyncWorker(env), deferred(deferred), win(win), action(action), err(NULL) {
                    this->p1 = p1 ? strdup(p1) : NULL;
                    this->p2 = p2 ? strdup(p2) : NULL;
                }
        ~UpdateStateWorker() {
            if (this->err)
                free(this->err);

            if (this->p1)
                free(this->p1);

            if (this->p2)
                free(this->p2);
        }

    void Execute() override {
        this->st = window_state(NULL, this->win, this->action, this->p1, this->p2);
    }

    void OnOK() override {
        Napi::Env env = Env();
        String err_js;

        if (this->st != WINDOW_STATE_SET) {
            this->err = get_libwmctrl_error("windowState", this->st);
            err_js = String::New(env, this->err);
            this->deferred.Reject(err_js);
        } else {
            this->deferred.Resolve(Boolean::New(env, true));
        }
    }

    private:
        Promise::Deferred deferred;
        Window win;
        unsigned long action;
        char *p1;
        char *p2;
        char *err;
        enum STATES st;
};

Promise windowStateAsync(const CallbackInfo &info) {
    Napi::Env env = info.Env();
    int win_id;
    char *action;
    char *p1;
    char *p2;
    char msg[128];
    unsigned long action_number = 0;

    win_id = info[0].As<Number>();
    action = strdup(info[1].As<String>().Utf8Value().c_str());
    p1 = strdup(info[2].As<String>().Utf8Value().c_str());
    p2 = strdup(info[3].As<String>().Utf8Value().c_str());

    if (strcmp(action, "REMOVE") == 0)
        action_number = _NET_WM_STATE_REMOVE;
    else if (strcmp(action, "ADD") == 0)
        action_number = _NET_WM_STATE_ADD;
    else if (strcmp(action, "TOGGLE") == 0)
        action_number = _NET_WM_STATE_TOGGLE;
    else {
        sprintf(msg, "[windowState] bad action provided (%s)", action);
        Napi::Error::New(env, msg)
            .ThrowAsJavaScriptException();
    }

    Promise::Deferred deferred = Promise::Deferred::New(env);
    UpdateStateWorker *wk = new UpdateStateWorker(env, deferred, win_id, action_number, p1, p2);
    wk->Queue();
    free(action);
    free(p1);
    free(p2);
    return deferred.Promise();
}

Boolean windowStateSync(const CallbackInfo &info) {
    Napi::Env env = info.Env();
    int win_id;
    char *action;
    char *p1;
    char *p2;
    char msg[128];
    unsigned long action_number = 0;
    enum STATES st;

    win_id = info[0].As<Number>();
    action = strdup(info[1].As<String>().Utf8Value().c_str());
    p1 = strdup(info[2].As<String>().Utf8Value().c_str());
    p2 = strdup(info[3].As<String>().Utf8Value().c_str());

    if (strcmp(action, "REMOVE") == 0)
        action_number = _NET_WM_STATE_REMOVE;
    else if (strcmp(action, "ADD") == 0)
        action_number = _NET_WM_STATE_ADD;
    else if (strcmp(action, "TOGGLE") == 0)
        action_number = _NET_WM_STATE_TOGGLE;
    else {
        sprintf(msg, "[windowStateSync] bad action provided (%s)", action);
        Napi::Error::New(env, msg)
            .ThrowAsJavaScriptException();
    }

    st = window_state(NULL, win_id, action_number, p1, p2);

    free(action);
    free(p1);
    free(p2);
    if (st != WINDOW_STATE_SET) {
        handling_libwmctrl_error(env, "windowStateSync", st);
        return Boolean::New(env, false);
    }

    return Boolean::New(env, true);
}