<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import ToggleSwitch from "primevue/toggleswitch";
import Select from "primevue/select";
import help from "../../../assets/Icons/help.png";
import Slider from "primevue/slider";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";

const props = defineProps<{
  label: string;
  value: string;
  options?: any;
  disabled?: boolean;
  helpText?: string;
  placeholder: string;
}>();

const emit = defineEmits(["update:value"]);

function updateValue(value: string) {
  emit("update:value", value);
}
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
    <div class="w-96 flex items-center gap-5">
      <Select
        @value-change="updateValue"
        v-model:modelValue="props.value"
        :options="props.options"
        :placeholder="placeholder"
        fluid
      />
    </div>
  </div>
</template>
<style></style>
