<template>
  <Teleport to="body">
    <div v-for="dialogRef in dialogs" :key="dialogRef.value.id">
      <Dialog
          v-model:visible="dialogRef.value.visible"
          modal
          @hide="() => handleHide(dialogRef.value)"
          v-bind="dialogRef.value.dialogProps"
      >
        <component
            :is="dialogRef.value.component"
            v-bind="dialogRef.value.componentProps"
            @ok="(payload: any) => handleOk(dialogRef.value, payload)"
            @cancel="() => handleCancel(dialogRef.value)"
        />
      </Dialog>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import {dialogs} from './DialogStore';
import {DialogInstance} from "./types/DialogInstance";

function removeDialog(id: number) {
  dialogs.value = dialogs.value.filter(d => d.value.id !== id);
}

function handleHide(dialogInstance: DialogInstance){
  dialogInstance.dismissHandler?.();
  removeDialog(dialogInstance.id);
}

function handleOk(dialogInstance: DialogInstance, payload: any) {
  dialogInstance.okHandler?.(payload);
  removeDialog(dialogInstance.id);
}

function handleCancel(dialogInstance: DialogInstance) {
  dialogInstance.cancelHandler?.();
  removeDialog(dialogInstance.id);
}
</script>
