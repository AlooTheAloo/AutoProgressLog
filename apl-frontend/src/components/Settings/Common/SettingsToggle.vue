<script setup lang="ts">
import { ref, watch } from "vue";
import ToggleSwitch from "primevue/toggleswitch";

import help from "../../../assets/Icons/help.png";

const props = defineProps<{
  label: string;
  value: boolean;
  password?: boolean;
  options?: any;
  disabled?: boolean;
  helpText?: string;
}>();

const emit = defineEmits(["update:value"]);

function updateValue(value: boolean) {
  console.log("Value updated to " + value);
  emit("update:value", value);
}

const forceTrue = (evt: any) => {
  console.log("Forced to true");
  toggleValue.value = true; // Revert any change back to true
};

const toggleValue = ref(props.value); // Initial value set to true

watch(props, () => {
  console.log("Props changed");
  toggleValue.value = props.value;
});
</script>

<template>
  <div class="flex items-center gap-10 w-full">
    <div class="flex h-12 items-center gap-2 w-64">
      <p>
        {{ label }}
      </p>
      <div class="h-full w-4">
        <img
          v-if="props.helpText != undefined"
          v-tooltip.top="props.helpText"
          place
          :src="help"
          class="h-4 w-4 mt-2"
        />
      </div>
    </div>

    <ToggleSwitch
      v-model="toggleValue"
      :disabled="props.disabled"
      v-on:value-change="updateValue"
    />
  </div>
</template>
