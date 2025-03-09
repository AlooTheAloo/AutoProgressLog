#include "wmctrl-napi.hpp"

using namespace Napi;

char *get_libwmctrl_error(const char *fnName, enum STATES st) {
    char *error = get_error_message(st);
    char *msg = (char*)calloc(sizeof(char), 512);
    if (error) {
        sprintf(msg, "[%s] %s", fnName, error);
        free(error);
    }
    else
        sprintf(msg, "[%s] %s", fnName, "Not enough memory error");
    return msg;
}

void handling_libwmctrl_error(Env env, const char *fnName, enum STATES st) {
    char buffer[512];
    char *msg = get_libwmctrl_error(fnName, st);
    strcpy(buffer, msg);
    free(msg);
    Error::New(env, buffer).ThrowAsJavaScriptException();
}

void checkNumber(const CallbackInfo &info, const char *fnName, const char*field, unsigned i) {
    Env env = info.Env();
    char buffer[512];

    if (info.Length() < i + 1) {
        sprintf(buffer, "Must have arg [%s] [%s]", field, fnName);
        Error::New(env, buffer)
            .ThrowAsJavaScriptException();
        return;
    }

    if (!info[i].IsNumber()) {
        sprintf(buffer, "%s must be a number [%s]", field, fnName);
        TypeError::New(env, buffer)
            .ThrowAsJavaScriptException();
    }
}

void checkId(const CallbackInfo &info, const char * fnName) {
    Env env = info.Env();
    char buffer[512];

    if (info.Length() < 1) {
        sprintf(buffer, "Must have arg wid_js [%s]", fnName);
        Error::New(env, buffer)
            .ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsNumber()) {
        sprintf(buffer, "win_js must be a number [%s]", fnName);
        TypeError::New(env, buffer)
            .ThrowAsJavaScriptException();
    }
}

void checkClassName(const CallbackInfo &info, const char *fnName) {
    Env env = info.Env();
    char buffer[512];
    if (info.Length() < 1) {
        sprintf(buffer, "Must have arg win_class_name_js [%s]", fnName);
        Error::New(env, buffer)
            .ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsString()) {
        sprintf(buffer, "win_class_name_js must be a string [%s]", fnName);
        TypeError::New(env, buffer)
            .ThrowAsJavaScriptException();
        return;
    }
}

void checkPid(const CallbackInfo &info, const char *fnName) {
    Env env = info.Env();
    char buffer[512];
    if (info.Length() < 1) {
        sprintf(buffer, "Must have arg wid_js [%s]", fnName);
        Error::New(env, buffer)
            .ThrowAsJavaScriptException();
        return;
    }

    if (!info[0].IsNumber()) {
        sprintf(buffer, "win_js must be a number [%s]", fnName);
        TypeError::New(env, buffer)
            .ThrowAsJavaScriptException();
        return;
    }
}