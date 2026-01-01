<script setup lang="ts">
import { Button } from "primevue";
import SettingsPathPicker from "../../components/Settings/Common/SettingsPathPicker.vue";
import { onMounted, ref } from "vue";

const filePath = ref("");

onMounted(() => {
  window.ipcRenderer.invoke("GetMagicAnkiFilePath").then((path: string) => {
    console.log("path is " + path);
    filePath.value = path;
  });
});

function updateFilePath(value: string) {
  filePath.value = value;
}
</script>

<template>
  <div class="w-[50rem] pt-2 flex h-18 gap-2">
    <SettingsPathPicker
      @update:value="updateFilePath"
      :value="filePath"
      label="Anki collection file"
      help-text="The Anki collection file to deduplicate."
    />
  </div>
  <div class="w-[50rem] pt-2 flex h-18 gap-2 justify-end">
    <Button :disabled="!filePath.endsWith('collection.anki2')"> Next </Button>
  </div>
</template>
