import {ref, type Ref} from 'vue';
import type {DialogInstance} from "./types/DialogInstance";

/**
 * Reactive list of all currently open dialogs.
 * Each dialog is wrapped in a `ref` so its state is reactive independently.
 */
export const dialogs: Ref<Ref<DialogInstance>[]> = ref([]);
