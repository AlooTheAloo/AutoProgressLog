/**
 * Chainable interface returned by the `dialog()` function.
 * Allows handling lifecycle events and controlling the dialog programmatically.
 */
export interface DialogChainObject {
    /**
     * Registers a callback to be executed when the dialog emits an `ok` event.
     * @param callbackFn - Function to call with optional payload from the dialog.
     * @returns The same chainable object.
     */
    onOk: (callbackFn: (payload?: any) => void) => DialogChainObject;

    /**
     * Registers a callback to be executed when the dialog emits a `cancel` event.
     * @param callbackFn - Function to call on cancellation.
     * @returns The same chainable object.
     */
    onCancel: (callbackFn: () => void) => DialogChainObject;

    /**
     * Registers a callback to be executed when the dialog is dismissed
     * (e.g., by clicking outside or pressing ESC).
     * @param callbackFn - Function to call on dismissal.
     * @returns The same chainable object.
     */
    onDismiss: (callbackFn: () => void) => DialogChainObject;

    /**
     * Hides the dialog manually.
     * @returns The same chainable object.
     */
    hide: () => DialogChainObject;

    /**
     * Updates the props passed to the dialog component.
     * Performs a shallow merge with the existing props.
     * @param opts - Partial props to update.
     * @returns The same chainable object.
     */
    update: (opts: any) => DialogChainObject;
}
