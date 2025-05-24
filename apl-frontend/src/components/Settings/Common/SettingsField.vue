<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { appPath } from "../../../pages/routes/appRoutes";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import help from "../../../assets/Icons/help.png";

const props = defineProps<{
  label: string;
  value?: string;
  password?: boolean;
  options?: any;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  link?: string;
}>();

const emit = defineEmits(["update:value"]);

function updateValue(value: any) {
  emit("update:value", value);
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
        <i
          v-if="props.helpText != undefined"
          v-tooltip.top="props.helpText"
          place
          class="pi pi-question-circle"
          :class="`h-4 w-4 mt-2 ${props.link ? 'cursor-pointer' : ''}`"
          @click="props.link ? openLink() : undefined"
        />
      </div>
    </div>
    <div class="w-96">
      <InputText
        v-if="!password"
        :disabled="disabled"
        @update:model-value="updateValue"
        v-model="value"
        type="text"
        size="large"
        :placeholder="placeholder"
        fluid
      />

      <Password
        v-else
        toggle-mask
        :feedback="false"
        v-model="value"
        :disabled="disabled"
        @update:model-value="updateValue"
        size="large"
        :placeholder="placeholder"
        fluid
      />
    </div>
  </div>
</template>
