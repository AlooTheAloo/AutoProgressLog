<script setup lang="ts">
import { computed, ref, useTemplateRef, watchEffect } from "vue";
import Delta from "../Common/Delta.vue";
import SmallIcon from "./SmallIcon.vue";
import { abbreviateNumber } from "js-abbreviation-number";
import { TPlusDelta } from "../../../types/Util";
import { roundTo, roundToDown } from "round-to";
import { useElementSize } from "@vueuse/core";

interface SmallWidgetProps {
  value: TPlusDelta<any>;
  title: string;
  units?: string;
  condense?: boolean;
  image: string;
  direction: number;
  hideDelta?: boolean;
  bottomText?: string;
}

const parent = ref();
const { width } = useElementSize(parent);

watchEffect(() => {
  if (width) {
    console.log(width.value);
  } else {
    console.log("doesnt exist :()");
  }
});

const hrValue = computed(() => {
  return props.condense
    ? abbreviateNumber(roundToDown(props.value.current, 2), 2)
    : props.value.current;
});

const props = defineProps<SmallWidgetProps>();
</script>

<template>
  <div
    class="w-96 h-36 bg-black rounded-xl flex items-center justify-center text-white"
    ref="parent"
  >
    <div
      class="h-36 pointer-events-none flex justify-end absolute"
      :style="{
        width: width + 'px',
      }"
    >
      <SmallIcon :image="image"></SmallIcon>
    </div>
    <div class="flex w-4/5 justify-center h-20">
      <div class="flex-grow flex flex-col justify-center py-12">
        <div class="font-extrabold flex items-center text-gray-400">
          {{ title }}
        </div>
        <div class="font-extrabold text-2xl">
          <div class="flex flex-row gap-3">
            <div>{{ hrValue }} {{ units ?? "" }}</div>
            <div class="flex-grow flex items-center" v-if="!hideDelta">
              <Delta v-bind:direction="direction" :delta="value.delta"></Delta>
            </div>
          </div>
        </div>
        <div v-html="props.bottomText" />
      </div>
    </div>
  </div>
</template>
