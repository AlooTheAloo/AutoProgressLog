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
    return "#EB3D3D";
  }
});
</script>
<template>
  <div
    :style="{
      backgroundColor: bgColor,
    }"
    class="h-6 w-fit flex items-center justify-center rounded-md text-black"
  >
    <div class="flex items-center justify-center text-sm font-bold gap-1 p-2">
      <div v-if="direction != 0">
        <svg
          :class="{ 'rotate-180': direction < 0 }"
          width="8"
          height="7"
          viewBox="0 0 8 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.87961 0.576752C3.41221 -0.191991 4.54873 -0.191991 5.08133 0.576752L7.72034 4.38584C8.3357 5.27403 7.70002 6.48779 6.61948 6.48779L1.34146 6.48779C0.260919 6.48779 -0.374766 5.27403 0.240596 4.38584L2.87961 0.576752Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {{ delta }}
    </div>
  </div>
</template>
