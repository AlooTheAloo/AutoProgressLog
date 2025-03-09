<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<DeltaProps>();

interface DeltaProps {
  delta: string | number;
  direction: number;
}

const bgColor = computed(() => {
  if (props.direction > 0) {
    return "#11C76F";
  }

  if (props.direction == 0) {
    return "#555555";
  } else {
    return "#FE7D7D";
  }
});
</script>
<template>
  <div
    :style="{
      backgroundColor: bgColor,
    }"
    class="h-6 w-fit flex items-center justify-center rounded-md text-white"
  >
    <div class="flex text-center text-sm font-bold gap-1 p-2">
      <div class="" v-if="direction != 0">
        <div
          v-if="direction > 0"
          class="pi pi-chevron-up"
          style="font-size: 0.7rem"
        />
        <div
          v-else-if="direction < 0"
          class="pi pi-chevron-down"
          style="font-size: 0.7rem"
        ></div>
      </div>
      {{ delta }}
    </div>
  </div>
</template>
