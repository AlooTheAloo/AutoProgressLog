<script setup lang="ts">
import { ref, watch } from "vue";
import ToggleSwitch from "primevue/toggleswitch";

import help from "../../../assets/Icons/help.png";
import Slider from "primevue/slider";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";

const props = defineProps<{
  label: string;
  value: number;
  options?: any;
  disabled?: boolean;
  helpText?: string;
  endText?: string;
  min: number;
  max: number;
}>();

const lastValue = ref(props.value);
const emit = defineEmits(["update:value"]);

function updateValue(value: number | number[]) {
  if (value == lastValue.value) return;
  if (Array.isArray(value)) {
    return;
  }
  emit("update:value", value);
  lastValue.value = value;
}
</script>

<template>
  <div class="flex items-center gap-10">
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
    <div class="flex-grow flex items-center gap-5">
      <div class="w-10">
        <InputNumber
          v-model="props.value"
          :min="min"
          :max="max"
          fluid
          v-on:value-change="updateValue"
        >
        </InputNumber>
      </div>

      <div class="flex-grow">
        <Slider
          :model-value="props.value"
          :disabled="props.disabled"
          v-on:value-change="updateValue"
          :min="min"
          :max="max"
          :step="1"
        />
      </div>
    </div>
    <div>
      <p>
        {{ endText }}
      </p>
    </div>
  </div>
</template>
<style>
.p-inputnumber-input {
  text-align: center;
}
</style>
