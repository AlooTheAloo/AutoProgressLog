<script setup lang="ts">
import { ref, watch } from "vue";
import help from "../../../assets/Icons/help.png";
import FileUpload from "primevue/fileupload";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
const props = defineProps<{
  label: string;
  password?: boolean;
  options?: any;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  link?: string;
}>();

const emit = defineEmits(["update:value"]);
const toast = useToast();

function updateValue() {
  console.log("Were so here");
  window.ipcRenderer.invoke("Upload-Profile-Picture").then((x) => {
    if (x == null) return;
    if (x) {
      toast.add({
        severity: "success",
        summary: "Profile picture uploaded!",
        detail: "Your profile picture was uploaded successfully.",
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Profile picture upload failed!",
        detail: "Your profile picture could not be uploaded. Please try again.",
      });
    }
  });
}

function openLink() {
  window.ipcRenderer.invoke("OpenExternal", props.link);
}
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
          :src="help"
          @click="props.link ? openLink() : undefined"
        />
      </div>
    </div>
    <div class="w-96 flex">
      <Button
        mode="basic"
        @click="updateValue"
        chooseLabel="Browse"
        :auto="true"
      >
        <i class="pi pi-plus"></i> Upload profile picture
      </Button>
    </div>
  </div>
</template>
