#include "wmctrl-napi.hpp"

class MoveResizeWorker : public AsyncWorker {
    public:
        MoveResizeWorker(Napi::Env &env, Promise::Deferred deferred, Window id, int g, int x, int y, int w, int h) 
            : AsyncWorker(env), deferred(deferred), id(id), g(g), x(x), y(y), w(w), h(h), err(NULL){}
        ~MoveResizeWorker() {
            if (this->err)
                free(this->err);
        }

    void Execute() override {
        this->st = window_move_resize(NULL, id, g, x, y, w, h);
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
        char *err;
        enum STATES st;
};

Promise windowMoveResizeAsync(const CallbackInfo &info) {
    checkNumber(info, "moveResizeWindow", "id", 0);
    checkNumber(info, "moveResizeWindow", "gravity", 1);
    checkNumber(info, "moveResizeWindow", "x", 2);
    checkNumber(info, "moveResizeWindow", "y", 3);
    checkNumber(info, "moveResizeWindow", "width", 4);
    checkNumber(info, "moveResizeWindow", "height", 5);
    Napi::Env env = info.Env();
    
    int id = info[0].As<Number>();
    int g = info[1].As<Number>();
    int x = info[2].As<Number>();
    int y = info[3].As<Number>();
    int w = info[4].As<Number>();
    int h = info[5].As<Number>();

    Promise::Deferred deferred = Promise::Deferred::New(env);
    MoveResizeWorker *wk = new MoveResizeWorker(env, deferred, id, g, x, y, w, h);
    wk->Queue();

    return deferred.Promise();
}

Boolean windowMoveResizeSync(const CallbackInfo &info) {
    checkNumber(info, "moveResizeWindow", "id", 0);
    checkNumber(info, "moveResizeWindow", "gravity", 1);
    checkNumber(info, "moveResizeWindow", "x", 2);
    checkNumber(info, "moveResizeWindow", "y", 3);
    checkNumber(info, "moveResizeWindow", "width", 4);
    checkNumber(info, "moveResizeWindow", "height", 5);

    Napi::Env env = info.Env();
    enum STATES st;
    int id = info[0].As<Number>();
    int g = info[1].As<Number>();
    int x = info[2].As<Number>();
    int y = info[3].As<Number>();
    int w = info[4].As<Number>();
    int h = info[5].As<Number>();

    st = window_move_resize(NULL, id, g, x, y, w, h);

    if (st != WINDOW_MOVED_RESIZED) {
        handling_libwmctrl_error(env, "moveResizeWindowSync", st);
        return Boolean::New(env, false);
    }
    return Boolean::New(env, true);
}