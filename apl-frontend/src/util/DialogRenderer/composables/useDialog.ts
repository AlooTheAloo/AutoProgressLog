import { getCurrentInstance } from "vue";
import type { DialogChainObject } from "../types/DialogChainObject";
import type { DialogOptions } from "../index";

/**
 * useDialog is a composable function that provides access to the $dialog instance.
 * It must be called within the setup() function of a Vue component.
 * @returns A function that takes `DialogOptions` and returns a `DialogChainObject`.
 */
export function useDialog(): useDialogFn {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error("useDialog must be called inside setup()");
  }

  const dialog = instance.proxy?.$dialog;

  if (!dialog) {
    throw new Error("$dialog is not available on globalProperties");
  }

  return dialog as unknown as useDialogFn;
}

type useDialogFn = (options: DialogOptions) => DialogChainObject;
