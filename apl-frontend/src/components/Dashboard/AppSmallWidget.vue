<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import Delta from "../Common/Delta.vue";
import SmallIcon from "./SmallIcon.vue";
import { abbreviateNumber } from "js-abbreviation-number";
import { TPlusDelta } from "../../../types/Util";
import { roundTo, roundToDown } from "round-to";
import { useElementSize } from "@vueuse/core";
import { motion } from "motion-v";

interface SmallWidgetProps {
  value: TPlusDelta<any>;
  title: string;
  units?: string;
  condense?: boolean;
  image: string;
  direction: number;
  hideDelta?: boolean;
  bottomText?: string;
  index: number;
}

const parent = ref();
const { width } = useElementSize(parent);

const hrValue = computed(() => {
  return props.condense
    ? abbreviateNumber(roundToDown(props.value.current, 2), 2)
    : props.value.current;
});

const props = defineProps<SmallWidgetProps>();
</script>

<template>
  <motion.div
    :initial="{
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
    }"
    :while-in-view="{
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
    }"
    :transition="{
      delay: 0.05 * props.index,
    }"
    class="w-96 h-36 relative bg-[#ebebec] dark:bg-black rounded-xl flex items-center justify-center text-white"
    ref="parent"
  >
    <div
      class="h-36 flex justify-end absolute"
      :style="{
        width: width + 'px',
      }"
    >
      <SmallIcon :image="image"></SmallIcon>
    </div>

    <div
      class="w-full h-36 relative rounded-xl flex items-center justify-center text-black dark:text-white border-2 border-transparent hover:border-[#22A7D1] trantiton-all duration-200"
    >
      <div class="flex w-4/5 justify-center">
        <div class="flex-grow flex flex-col justify-center py-12">
          <div
            class="font-extrabold flex items-center text-gray-600 dark:text-gray-400"
          >
            {{ title }}
          </div>
          <div class="font-extrabold text-2xl">
            <div class="flex flex-row gap-3">
              <div>{{ hrValue }} {{ units ?? "" }}</div>
              <div class="flex-grow flex items-center" v-if="!hideDelta">
                <Delta
                  v-bind:direction="direction"
                  :delta="value.delta"
                ></Delta>
              </div>
            </div>
          </div>
          <div v-html="props.bottomText" />
        </div>
      </div>
    </div>
  </motion.div>
</template>
