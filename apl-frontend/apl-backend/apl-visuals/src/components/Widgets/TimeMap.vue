<script setup lang="ts">
import { RelativeReportData, TPlusDelta } from "../../types/report-data";
import { computed, ref } from "vue";
import { interpolateLab } from "d3-interpolate";
import pluralize from "pluralize";
import MatureCards from "/Icons/MatureCards.png";
import Delta from "../Delta.vue";

interface TimeMapProps {
  title: string;
  data: RelativeReportData[];
  streak: TPlusDelta<number>;
}

const props = defineProps<TimeMapProps>();
const sortedDataByReport = ref(
  props.data.slice(0, 24).sort((a, b) => b.reportNo - a.reportNo),
);
const sortedDataByRelativeCount = ref(
  props.data.slice(0, 24).sort((a, b) => b.value - a.value),
);

const cardData = computed(() => {
  const max = sortedDataByRelativeCount.value[0];
  const min = sortedDataByRelativeCount.value.at(-1);
  if (min == undefined) return;
  const delta = max.value - min.value;

  return sortedDataByReport.value.map((x) => {
    return {
      reportNo: x.reportNo,
      color:
        x.value == 0
          ? "#222222"
          : delta == 0
            ? colorGradient(1)
            : colorGradient((x.value - min.value) / delta),
    };
  });
});

const colorGradient = interpolateLab("#05006e", "#9c96ff");
</script>

<template>
  <div class="rounded-xl flex w-full bg-black h-[23rem]">
    <div class="w-full flex justify-center">
      <div class="pl-1 flex flex-col w-[90%] pt-5">
        <div class="flex-col justify-around">
          <div class="flex flex-col">
            <div class="flex items-center">
              <div class="flex-grow">
                <div class="font-normal tracking-wider">
                  {{ props.title }}
                </div>
                <div class="font-extrabold text-3xl">
                  <div class="flex flex-row">
                    <div>
                      {{ pluralize("report", props.streak.current, true) }}
                    </div>
                    <div class="flex-grow">
                      <Delta v-bind:delta="props.streak.delta"></Delta>
                    </div>
                  </div>
                </div>
              </div>
              <div class="w-10">
                <img class="ml-2" v-bind:src="MatureCards" />
              </div>
            </div>
            <div class="mt-3"></div>
            <div
              class="flex flex-wrap gap-5 pb-6"
              :style="{ gap: '20px 15px' }"
            >
              <div
                class="font-semibold flex w-[76.7px] h-[46px] rounded-lg justify-center items-center"
                v-for="(_, n) in 24"
                :style="{
                  backgroundColor:
                    ((cardData ?? [])[n] ?? {}).color ?? '#454545',
                }"
              >
                {{ ((cardData ?? [])[n] ?? {}).reportNo ?? "" }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
