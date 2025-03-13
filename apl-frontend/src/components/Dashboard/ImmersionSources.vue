<script setup lang="ts">
import play from "../../assets/Icons/play.png";
import ApexCharts from "vue3-apexcharts";
import { ApexOptions } from "apexcharts";
import { interpolateLab } from "d3-interpolate";
import {
  computed,
  ComputedRef,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch,
} from "vue";
import dayjs from "dayjs";
import { useWindowSize } from "@vueuse/core";
import { NWayInterpol } from "../../util/n-way-interpol";
import { ImmersionSource } from "../../../electron/main/Electron-Backend/types/Dashboard";
import pluralize from "pluralize";
import formatTime from "../../util/timeFormat";

const { width, height } = useWindowSize();

const limit /* As x goes to infinity ??? */ = ref<number>(
  width.value >= 1820 ? 50 : 12,
);
const props = defineProps<{
  sources: ImmersionSource[];
}>();

const totalHours = computed(() => {
  return (
    props.sources.reduce((acc, x) => acc + x.relativeValue, 0) / 3600
  ).toFixed(2);
});

watch(width, () => {
  width.value >= 1820 ? (limit.value = 25) : (limit.value = 12);
});

const sortedSources = computed(() => {
  const sort = props.sources.sort((a, b) => b.relativeValue - a.relativeValue);
  const bottomActivitiesSeconds = sort
    .slice(limit.value)
    .reduce((a, b) => a + b.relativeValue, 0);

  let arr = [...sort.slice(0, limit.value)];

  if (sort.length > limit.value) {
    arr.push({
      name: `${sort.length - limit.value} other${sort.length - limit.value > 1 ? "s" : ""}`,
      relativeValue: bottomActivitiesSeconds,
    });
  }

  return arr.map((x) => {
    return {
      name: x.name,
      relativeValue: x.relativeValue,

      hr: formatTime(x.relativeValue),
    };
  });
});

const totalTime = computed(() => {
  return sortedSources.value.reduce((acc, x) => acc + x.relativeValue, 0);
});

const colors = computed(() => {
  const ret: string[] = [];
  const a = sortedSources.value.map((x) => x.relativeValue);

  a.reduce((acc, x, i) => {
    ret.push(gradient.interpolate(acc / totalTime.value));
    return acc + x;
  }, 0);
  return ret;
});

let gradient = new NWayInterpol("#FF6961", "#33ffbf", "#cc8fff");

let options: ComputedRef<ApexOptions> = computed(() => {
  const ret: ApexOptions = {
    chart: {
      width: width.value >= 1820 ? 500 : 300,
      animations: {
        enabled: false,
      },
    },
    states: {
      active: {
        filter: {
          type: "none",
        },
      },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "90%",
        },
      },
    },
    stroke: {
      width: 1,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    colors: colors.value,
    tooltip: {
      custom: function ({ seriesIndex }: { seriesIndex: number }) {
        {
          const value = sortedSources.value[seriesIndex];
          return `<div class="flex flex-col gap-2">
                            <div class="flex flex-row gap-2 items-center p-2">
                                <div class="w-3 h-3 rounded-full" style="background-color: ${colors.value[seriesIndex]}">
                            </div>
                            <p class="text-ellipsis overflow-hidden whitespace-nowrap text-sm font-normal">
                                ${value.name}
                            </p>
                            <p class="text-ellipsis overflow-hidden whitespace-nowrap text-sm font-normal">
                                ${value.hr}
                            </p>
                        </div>`;
        }
      },
    },
  };
  return ret;
});

let series /* Literally a calculus reference */ = computed(() => {
  return sortedSources.value.map((x) => x.relativeValue);
});
</script>

<template>
  <div class="flex bg-black 1820:h-[40rem] h-96 rounded-lg w-full">
    <!-- Left Section -->
    <div class="flex flex-col px-10 flex-1 overflow-hidden">
      <!-- Title -->
      <div class="h-20 flex flex-col justify-center w-fit">
        <div
          class="font-normal tracking-wider flex items-center gap-2 text-white"
        >
          <img class="w-5" v-bind:src="play" />
          Immersion sources in the last 30 days
        </div>
      </div>

      <!-- List Section -->
      <div
        class="text-white flex flex-col justify-start w-full overflow-hidden"
      >
        <div
          v-for="(x, i) in sortedSources"
          :key="x.name"
          class="flex flex-row items-center gap-2 w-full"
        >
          <div
            :style="{
              backgroundColor: colors[i],
            }"
            class="w-3 h-3 rounded-full"
          />
          <p
            class="text-ellipsis overflow-hidden whitespace-nowrap text-sm font-normal"
          >
            {{ x.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- ApexCharts Section -->
    <div class="flex flex-col items-center justify-center flex-none relative">
      <div class="absolute flex flex-col items-center">
        <div class="font-bold text-xl 1820:text-3xl text-white">
          {{ totalHours }} hours
        </div>
        <div class="text-sm 1820:text-xl">
          From {{ props.sources.length }}
          {{ pluralize("source", props.sources.length) }}
        </div>
      </div>
      <ApexCharts
        type="donut"
        :options="options"
        :series="series"
        @click.stop
      />
    </div>
  </div>
</template>
