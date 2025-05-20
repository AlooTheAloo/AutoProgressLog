<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { appPath } from "../../../pages/routes/appRoutes";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import help from "../../../assets/Icons/help.png";
import RadioButton from "primevue/radiobutton";
import MultiSelect from "primevue/multiselect";

const props = defineProps<{
  label: string;
  value?: any[];
  password?: boolean;
  options?: any[];
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
  console.log(props.value);
  value.value = props.value ?? [];
});

const value = ref<any[]>([]);
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
    <div class="flex-grow lg:gap-10">
      <MultiSelect
        :options="options"
        :model-value="value"
        @update:model-value="updateValue"
        option-label="name"
        :show-toggle-all="false"
        option-value="id"
        class="w-96"
        placeholder="Select decks to track"
        display="chip"
        :disabled="props.disabled"
      />
    </div>
  </div>
</template>
