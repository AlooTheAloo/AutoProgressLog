import {ref} from 'vue';
import type {DialogInstance} from "./types/DialogInstance";
import {dialogs} from './DialogStore';
import type {DialogChainObject} from "./types/DialogChainObject";
import type {DialogProps} from "primevue";

let dialogIdCounter = 0;

/**
 * Opens a new dialog using the given component and props.
 *
 * Returns a chainable object that allows the caller to register
 * handlers (`onOk`, `onCancel`, `onDismiss`) and control the dialog (`hide`, `update`).
 *
 * @param opts - Dialog options including the component to render and its props.
 * @returns A chainable DialogChainObject.
 */
export function dialog(opts: {
    component: any;
    componentProps?: Record<string, any>;
    dialogProps?: DialogProps;
}): DialogChainObject {
    const id = dialogIdCounter++;

    const dialogRef = ref<DialogInstance>({
        id,
        component: opts.component,
        componentProps: opts.componentProps || {},
        dialogProps: opts.dialogProps || {},
        visible: true,
        okHandler: undefined,
        cancelHandler: undefined,
        dismissHandler: undefined,
    });

    //@ts-ignore
    dialogs.value.push(dialogRef);

    const api: DialogChainObject = {
        onOk(fn) {
            dialogRef.value.okHandler = fn;
            return api;
        },
        onCancel(fn) {
            dialogRef.value.cancelHandler = fn;
            return api;
        },
        onDismiss(fn) {
            dialogRef.value.dismissHandler = fn;
            return api;
        },
        hide() {
            dialogRef.value.visible = false;
            return api;
        },
        update(newProps) {
            dialogRef.value.componentProps = {
                ...dialogRef.value.componentProps,
                ...newProps,
            };
            return api;
        },
    };

    return api;
}