import { DialogProps } from "primevue";
import type { Component, Ref } from "vue";

/**
 * Payload passed to the dialog's onOk callback.
 */
export type DialogPayload = any;

/**
 * Props passed when opening a new dialog.
 */
export interface DialogOptions {
  /**
   * Vue component to render inside the dialog.
   */
  component: Component;

  /**
   * Props to pass to your custom dialog component.
   */
  componentProps?: Record<string, any>;

  /**
   * Props to pass to the PrimeVue dialog component.
   */
  dialogProps?: DialogProps;
}

/**
 * Chainable object returned by `dialog()` to handle dialog lifecycle.
 */
export interface DialogChainObject {
  /**
   * Called when dialog emits `ok(payload?)`.
   */
  onOk(callback: (payload?: DialogPayload) => void): DialogChainObject;

  /**
   * Called when dialog emits `cancel`.
   */
  onCancel(callback: () => void): DialogChainObject;

  /**
   * Called when dialog is dismissed (via ESC or backdrop).
   */
  onDismiss(callback: () => void): DialogChainObject;

  /**
   * Hides the dialog programmatically.
   */
  hide(): DialogChainObject;

  /**
   * Updates props passed to the component.
   */
  update(newProps: Record<string, any>): DialogChainObject;
}

/**
 * Main function to open a dialog.
 *
 * @param options - Dialog options including component and props.
 * @returns Chainable object to handle dialog lifecycle.
 */
export declare function dialog(options: DialogOptions): DialogChainObject;

/**
 * Composable for use inside dialog components.
 *
 * Provides:
 * - `dialogRef (optional ref to base dialog)`
 * - `onDialogOK(payload)`
 * - `onDialogCancel()`
 * - `onDialogHide()`
 */
export declare function useDialogComponent<T = any>(): {
  dialogRef: Ref<any | undefined>;
  onDialogOK: (payload?: T) => void;
  onDialogCancel: () => void;
  onDialogHide: () => void;
};

export declare namespace useDialogComponent {
  const emits: ["ok", "hide"];
  const emitsObject: {
    ok: (payload?: any) => true;
    hide: () => true;
  };
}
