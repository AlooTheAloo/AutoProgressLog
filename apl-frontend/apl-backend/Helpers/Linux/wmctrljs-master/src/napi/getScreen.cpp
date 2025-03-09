#include "wmctrl-napi.hpp"

Object create_screen(Env env, Screen *sc) {
    Object screen_js = Object::New(env);
    screen_js.Set("backing_store", sc->backing_store);
    screen_js.Set("black_pixel", sc->black_pixel);
    screen_js.Set("cmap", sc->cmap);
    screen_js.Set("height", sc->height);
    screen_js.Set("max_maps", sc->max_maps);
    screen_js.Set("mheight", sc->mheight);
    screen_js.Set("min_maps", sc->min_maps);
    screen_js.Set("mwidth", sc->mwidth);
    screen_js.Set("ndepths", sc->ndepths);
    screen_js.Set("root_depth", sc->root_depth);
    screen_js.Set("root_input_mask", sc->root_input_mask);
    screen_js.Set("save_unders", sc->save_unders);
    screen_js.Set("white_pixel", sc->white_pixel);
    screen_js.Set("width", sc->width);
    return screen_js;
}

class GetScreenWorker : public AsyncWorker {
    public:
        GetScreenWorker(Napi::Env &env, Promise::Deferred deferred) 
        : AsyncWorker(env), deferred(deferred){}
        ~GetScreenWorker() {}

    void Execute() override {
        this->sc = get_screen(NULL, &this->st);
    }

    void OnOK() override {
        Object sc_js;
        String err_js;
        char *err;

        if (this->st != SCREEN_GET) {
            err = get_error_message(st);
            err_js = String::New(Env(), err);
            free(err);
            this->deferred.Reject(err_js);
        } else {
            sc_js = create_screen(Env(), this->sc);
            free_screen(this->sc);
            this->deferred.Resolve(sc_js);
        }
    }

    void OnError(Napi::Error const &error) override {
        this->deferred.Reject(error.Value());
    }

    private:
        enum STATES st;
        Screen *sc;
        Promise::Deferred deferred;
};

Promise getScreenAsync(const CallbackInfo &info) {
    Napi::Env env = info.Env();
    Promise::Deferred deferred = Promise::Deferred::New(env);
    GetScreenWorker *wk = new GetScreenWorker(env, deferred);
    wk->Queue();
    return deferred.Promise();
}

Value getScreenSync(const CallbackInfo &info) {
    Env env = info.Env();
    Object screen_js;
    enum STATES st;
    Screen *sc = get_screen(NULL, &st);
    if (!sc || st != SCREEN_GET) {
        handling_libwmctrl_error(env, "getScreenSync", st);
        return env.Null();
    }

    screen_js = create_screen(env, sc);
    free_screen(sc);
    return screen_js;
}