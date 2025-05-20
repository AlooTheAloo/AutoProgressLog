import {ref, getCurrentInstance} from "vue";

/**
 * A composable to be used inside custom dialog components.
 *
 * Provides lifecycle utilities for emitting `ok` and `hide` events
 * in a standardized way, compatible with the dialog management system.
 *
 * @returns Functions and refs to control dialog behavior from within a dialog component.
 */
function _useDialogComponent<T = any>() {
    const instance = getCurrentInstance();
    if (!instance) {
        throw new Error("useDialogComponent must be used inside setup()");
    }

    const emit = instance.emit;
    const dialogRef = ref<any>();

    /**
     * Call this to emit an "ok" event with an optional payload and close the dialog.
     * @param payload - Optional data to pass to the handler.
     */
    function onDialogOK(payload?: T) {
        emit("ok", payload);
        emit("hide");
    }

    /**
     * Call this to cancel the dialog (no payload), equivalent to dismissing.
     */
    function onDialogCancel() {
        emit("hide");
    }

    /**
     * Generic hide method, e.g., for ESC/backdrop use.
     */
    function onDialogHide() {
        emit("hide");
    }

    return {
        dialogRef,
        onDialogOK,
        onDialogCancel,
        onDialogHide,
    };
}

/**
 * Emits to be declared in components using `useDialogComponent`.
 * For compatibility and IDE support.
 */
_useDialogComponent.emits = ["ok", "hide"] as const;

/**
 * Object form of emits, compatible with `<script setup>`'s `defineEmits()`.
 */
_useDialogComponent.emitsObject = {
    ok: (payload?: any) => true,
    hide: () => true,
} as const;

export const useDialogComponent = _useDialogComponent;
