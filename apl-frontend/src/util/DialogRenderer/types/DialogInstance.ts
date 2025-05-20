/**
 * Represents the internal state of a single dialog instance.
 */
export interface DialogInstance {
    /**
     * Unique ID used to track and remove this dialog.
     */
    id: number;

    /**
     * Vue component to render inside the dialog.
     */
    component: any;

    /**
     * Props to pass to the dialog component.
     */
    componentProps: Record<string, any>;

    /**
     * Whether the dialog is currently visible.
     */
    visible: boolean;

    /**
     * Function called when dialog emits `ok` event.
     */
    okHandler?: (payload?: any) => void;

    /**
     * Function called when dialog emits `cancel` event.
     */
    cancelHandler?: () => void;

    /**
     * Function called when the dialog is dismissed (e.g., backdrop click or ESC).
     */
    dismissHandler?: () => void;
}
