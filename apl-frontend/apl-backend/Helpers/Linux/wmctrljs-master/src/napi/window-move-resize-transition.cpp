#include "wmctrl-napi.hpp"

class MoveResizeTransitionWorker: public AsyncWorker {
    public:
        MoveResizeTransitionWorker(Napi::Env &env, Promise::Deferred deferred, Window id, int g, int x, int y, int w, int h, float await_time, int pad) 
            : AsyncWorker(env), deferred(deferred), id(id), g(g), x(x), y(y), w(w), h(h), await_time(await_time), pad(pad), err(NULL) {}
        ~MoveResizeTransitionWorker() {
            if (this->err)
                free(this->err);
        }

    void Execute() override {
        this->st = window_move_resize_transition(NULL, id, g, x, y, w, h, await_time, pad);
    }

    void OnOK() override {
        Napi::Env env = Env();
        String err_js;

        if (this->st != WINDOW_MOVED_RESIZED) {
            this->err = get_libwmctrl_error("MoveResizeWorker", this->st);
            err_js = String::New(env, this->err);
            this->deferred.Reject(err_js);
        }
        else {
            this->deferred.Resolve(Boolean::New(env, true));
        }
    }

    private:
        Promise::Deferred deferred;
        Window id;
        int g,x,y,w,h;
        float await_time;
        int pad;
        char *err;
        enum STATES st;
};

Promise windowMoveResizeTransitionAsync(const CallbackInfo &info) {
    checkNumber(info, "windowMoveResizeTransition", "id", 0);
    checkNumber(info, "windowMoveResizeTransition", "gravity", 1);
    checkNumber(info, "windowMoveResizeTransition", "x", 2);
    checkNumber(info, "windowMoveResizeTransition", "y", 3);
    checkNumber(info, "windowMoveResizeTransition", "width", 4);
    checkNumber(info, "windowMoveResizeTransition", "height", 5);
    checkNumber(info, "windowMoveResizeTransition", "await_time", 6);
    checkNumber(info, "windowMoveResizeTransition", "pad", 7);

    Napi::Env env = info.Env();
    int id = info[0].As<Number>();
    int g = info[1].As<Number>();
    int x = info[2].As<Number>();
    int y = info[3].As<Number>();
    int w = info[4].As<Number>();
    int h = info[5].As<Number>();
    float await_time = info[6].As<Number>();
    int pad = info[7].As<Number>();

    Promise::Deferred deferred = Promise::Deferred::New(env);
    MoveResizeTransitionWorker *wk = new MoveResizeTransitionWorker(env, deferred, id, g, x, y, w, h, await_time, pad);
    wk->Queue();
    return deferred.Promise();
}