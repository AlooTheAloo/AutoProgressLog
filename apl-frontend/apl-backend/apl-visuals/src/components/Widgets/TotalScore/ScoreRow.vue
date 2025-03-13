<script setup lang="ts">
const props = defineProps<ScoreRowProps>();

interface ScoreRowProps {
  title: string;
  value: number;
  isTotal?: boolean;
  isMultiplier?: boolean;
}
</script>

<template>
  <div
    class="flex flex-row text-lg"
    :class="{ 'pt-6 pb-3': props.isTotal, 'py-3.5': !props.isTotal }"
  >
    <div
      class="flex-grow"
      :class="{
        'text-[1.5rem] font-black': props.isTotal,
        'text-[1.15rem] font-semibold': !props.isTotal,
      }"
    >
      {{ props.title }}
    </div>
    <div class="flex" :class="{ ' text-xl': props.isTotal }">
      <div v-if="!props.isTotal && !props.isMultiplier">+</div>
      <div v-if="props.isMultiplier">x</div>

      <div class="w-1"></div>

      <div
        :class="{
          'text-[1.5rem] font-black': props.isTotal,
          'text-[1.15rem] font-semibold': !props.isTotal,
        }"
      >
        {{ props.value }}
      </div>
    </div>
  </div>
</template>
