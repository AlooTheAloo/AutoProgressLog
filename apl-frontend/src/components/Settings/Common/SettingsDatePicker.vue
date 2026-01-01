<script setup lang="ts">
import help from "../../../assets/Icons/help.png";
import DatePicker from "primevue/datepicker";

const props = defineProps<{
  label: string;
  modelValue?: Date;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Date | null): void;
}>();
</script>

<template>
  <div class="flex items-center gap-10 w-full h-12">
    <div class="flex h-full items-center gap-2 w-64">
      <p>{{ label }}</p>
      <div class="h-full w-4">
        <img
          v-if="helpText != undefined"
          v-tooltip.top="helpText"
          :src="help"
          class="h-4 w-4 mt-2"
        />
      </div>
    </div>

    <DatePicker
      :disabled="disabled"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event as Date | null)"
      hour-format="12"
      class="h-12"
      id="datepicker-timeonly"
      timeOnly
      :placeholder="placeholder"
    />
  </div>
</template>
