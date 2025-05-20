<template>
  <Teleport to="body">
    <div v-for="dialogRef in dialogs" :key="dialogRef.value.id">
      <Dialog
          v-model:visible="dialogRef.value.visible"
          modal
          @hide="() => {
          dialogRef.value.dismissHandler?.();
          removeDialog(dialogRef.value.id);
        }"
      >
        <component
            :is="dialogRef.value.component"
            v-bind="dialogRef.value.componentProps"
            @ok="(payload: any) => {
            dialogRef.value.okHandler?.(payload);
            removeDialog(dialogRef.value.id);
          }"
            @cancel="() => {
            dialogRef.value.cancelHandler?.();
            removeDialog(dialogRef.value.id);
          }"
        />
      </Dialog>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { dialogs } from './DialogStore';

function removeDialog(id: number) {
  dialogs.value = dialogs.value.filter(d => d.value.id !== id);
}
</script>
