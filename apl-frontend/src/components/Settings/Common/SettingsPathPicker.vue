<script setup lang="ts">
import { ref, watch } from "vue";
import help from "../../../assets/Icons/help.png";
import Button from "primevue/button";
import folder_open from "../../../assets/Icons/Folder_Open.png";

const props = defineProps<{
  label: string;
  value?: string;
  password?: boolean;
  options?: any;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  link?: string;
  folder?: boolean;
}>();

const emit = defineEmits(["update:value"]);

function updateValue(value: any) {
  emit("update:value", value);
}

function chooseFilePath() {
  console.log("props folder is " + props.folder);
  window.ipcRenderer
    .invoke(!!props.folder ? "OpenPathDialog" : "OpenFileDialog", value.value)
    .then((path) => {
      console.log(path);
      if (!path || path.length == 0) return;
      value.value = path[0];
      updateValue(value.value);
    });
}

function openLink() {
  window.ipcRenderer.invoke("OpenExternal", props.link);
}

watch(props, () => {
  value.value = props.value ?? "";
});

const value = ref<string>(props.value ?? "");
</script>

<template>
  <div class="flex items-center gap-10 w-full h-12">
    <div class="flex h-full items-center gap-2 w-64">
      <p>
        {{ label }}
      </p>
      <div class="h-full w-4">
        <img
          v-if="props.helpText != undefined"
          v-tooltip.top="props.helpText"
          place
          :src="help"
          :class="`h-4 w-4 mt-2 ${props.link ? 'cursor-pointer' : ''}`"
          @click="props.link ? openLink() : undefined"
        />
      </div>
    </div>
    <div
      class="flex-grow w-0 border-[2px] border-[#FFFFFF] border-opacity-40 rounded-lg"
    >
      <Button
        fluid
        class="truncate-button"
        severity="secondary"
        @click="chooseFilePath"
        :disabled="props.disabled"
      >
        <div class="flex w-full items-center justify-between h-8">
          <!-- The truncating text -->
          <div
            class="flex-grow text-sm text-ellipsis overflow-hidden whitespace-nowrap truncate dark:text-white text-black"
          >
            {{ value }}
          </div>
          <!-- Fixed-size "Click to edit" and image -->
          <div class="flex justify-end gap-1 items-center min-w-24">
            <img class="w-4 h-3" :src="folder_open" />
            <span class="text-xs text-blue-300 text-end">Click to edit</span>
          </div>
        </div>
      </Button>
    </div>
  </div>
</template>
