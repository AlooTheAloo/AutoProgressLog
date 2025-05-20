<script setup lang="ts">
import MatureCards from "../../../public/Icons/MatureCards.svg";
import { computed } from "vue";
import { relativeActivity } from "../../types/report-data";
import formatTime from "../../util/timeFormat";
const limit = 7;

interface ImmersionLogProps {
  log: relativeActivity[];
}
const props = defineProps<ImmersionLogProps>();

const hrTotal = computed(() => {
  return formatTime(props.log.reduce((a, b) => a + b.relativeValue, 0));
});
const sortedActivities = computed(() => {
  const sorted = [...props.log].sort(
    (a, b) => b.relativeValue - a.relativeValue
  );

  if (sorted.length <= limit)
    return sorted.map((x) => {
      return {
        name: x.name,
        relativeValue: x.relativeValue,
        hr: formatTime(x.relativeValue),
      };
    });

  const bottomActivitiesSeconds = sorted
    .slice(limit)
    .reduce((a, b) => a + b.relativeValue, 0);
  const othersActivity: relativeActivity = {
    name: `${sorted.length - limit} other${
      sorted.length - limit > 1 ? "s" : ""
    }`,
    relativeValue: bottomActivitiesSeconds,
  };

  return [...sorted.slice(0, limit), othersActivity].map((x) => {
    return {
      name: x.name,
      relativeValue: x.relativeValue,
      hr: formatTime(x.relativeValue),
    };
  });
});
</script>

<template>
  <div class="rounded-xl flex w-full bg-black h-[23rem]">
    <div class="w-full flex items-center px-7 flex-col">
      <div class="pl-1 flex flex-col w-full pt-5">
        <div class="flex">
          <div class="flex flex-col flex-grow">
            <div class="flex flex-col">
              <div class="font-normal tracking-wider">Immersion Log</div>
              <div class="font-extrabold text-3xl">
                <div class="flex flex-row">
                  <div>
                    {{ hrTotal }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-10">
            <img class="ml-[0.35rem]" v-bind:src="MatureCards" />
          </div>
        </div>
      </div>
      <div class="w-full flex-grow">
        <div class="divide-y divide-[#283B2C] w-full flex flex-col">
          <div
            v-for="(item, index) in sortedActivities"
            :key="index"
            class="h-[2.1rem] flex flex-col"
          >
            <div
              class="gap-2 flex flex-grow items-center w-full font-bold text-sm"
            >
              <div class="flex-grow">
                {{ item.name }}
              </div>
              <div>
                {{ item.hr }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
