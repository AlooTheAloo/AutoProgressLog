import {getCurrentInstance} from "vue";
import type {DialogChainObject} from "../types/DialogChainObject";
import type {DialogOptions} from "../index";

export function useDialog(): (options: DialogOptions) => DialogChainObject {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error("useDialog must be called inside setup()");
    }

    // @ts-ignore
    const dialog = instance.proxy?.$dialog;

    if (!dialog) {
        throw new Error('$dialog is not available on globalProperties');
    }

    return dialog;
}