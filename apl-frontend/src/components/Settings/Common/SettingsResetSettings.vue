<script setup lang="ts">
import { ref } from "vue";
import helpIcon from "../../../assets/Icons/help.png";

import Button from "primevue/button";
import Dialog from "primevue/dialog";

const resetDialogVisible = ref<boolean>(false);

const props = defineProps<{
  label: string;
  helpText?: string;
}>();

function resetSettings() {
  window.ipcRenderer.invoke("reset-settings");
}
</script>

<template>
  <Dialog
    v-model:visible="resetDialogVisible"
    modal
    header="Reset account settings"
    :style="{ width: '30rem' }"
    :closeOnEscape="true"
    :closable="true"
  >
    <span
      class="text-surface-500 dark:text-surface-400 block mb-8 text-red-600 font-bold"
    >
      CAUTION! This will WIPE your application data, any data WILL be erased and
      WILL NOT be recoverable. <br />
      <br />
      Are you sure you want to continue?
    </span>
    <div class="flex justify-end gap-2 mt-5">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="resetDialogVisible = false"
      ></Button>
      <Button
        severity="danger"
        type="button"
        label="Yes, delete all app data"
        @click="resetSettings"
      ></Button>
    </div>
  </Dialog>
  <div class="flex items-center gap-10 w-full h-12">
    <div class="flex h-full items-center gap-2 w-64">
      <p>
        {{ label }}
      </p>
      <div class="h-full w-4">
        <img
          v-if="props.helpText != undefined"
          v-tooltip.top="props.helpText"
          :src="helpIcon"
        />
      </div>
    </div>
    <div class="w-96 flex">
      <Button severity="danger" @click="resetDialogVisible = true" :auto="true">
        Reset app data
      </Button>
    </div>
  </div>
</template>
