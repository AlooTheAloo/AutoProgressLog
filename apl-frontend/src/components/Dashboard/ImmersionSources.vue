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
  toRef,
  watch,
} from "vue";
import dayjs from "dayjs";
import { useWindowSize } from "@vueuse/core";
import { NWayInterpol } from "../../util/n-way-interpol";
import { ImmersionSource } from "../../../electron/main/Electron-Backend/types/Dashboard";
import pluralize from "pluralize";
import formatTime from "../../util/timeFormat";

type DashboardImmersionSource = {
  name: string;
  relativeValue: number;
  enabled: boolean;
  colorIndex: number;
};

const { width, height } = useWindowSize();

const limit /* As x goes to infinity ∫sqrt(tan x) dx ??? */ = ref<number>(4);
const props = defineProps<{
  sources: ImmersionSource[];
}>();

const totalHours = computed(() => {
  return (
    props.sources.reduce((acc, x) => acc + x.relativeValue, 0) / 3600
  ).toFixed(2);
});

const computedSources = ref<DashboardImmersionSource[]>([]);

watch(
  props.sources,
  () => {
    computedSources.value = props.sources
      .sort((a, b) => b.relativeValue - a.relativeValue)
      .map((x: ImmersionSource, i) => {
        return {
          name: x.name,
          relativeValue: x.relativeValue,
          enabled: true,
          colorIndex: i,
        };
      });
  },
  {
    deep: true,
    immediate: true,
  }
);

const dateString = computed(() => {
  const now = dayjs();
  const start = now.subtract(30, "days");
  const end = now;

  return `Data from ${start.format("D MMM YYYY")} - ${end.format(
    "D MMM YYYY"
  )}`;
});

const sortedSources = computed(() => {
  const sort = computedSources.value.sort(
    (a, b) => b.relativeValue - a.relativeValue
  );
  const bottomActivitiesSeconds = sort
    .slice(limit.value)
    .reduce((a, b) => a + b.relativeValue, 0);
  let arr = [...sort.slice(0, limit.value)];
  if (sort.length > limit.value) {
    arr.push({
      name: `${sort.length - limit.value} other${
        sort.length - limit.value > 1 ? "s" : ""
      }`,
      relativeValue: bottomActivitiesSeconds,
      enabled: true,
      colorIndex: 727,
    });
  }
  return arr
    .filter((x) => x.enabled)
    .map((x) => {
      console.log(x);
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
    ret.push(gradient.interpolate(i / a.length));
    return acc + x;
  }, 0);
  return ret;
});

let gradient = new NWayInterpol("#ff0000", "#00ff00", "#0000ff", "#ff00ff");

let options: ComputedRef<ApexOptions> = computed(() => {
  const ret: ApexOptions = {
    chart: {
      width: 300,
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
      width: 0,
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
  <div class="flex flex-col bg-black rounded-lg w-1/2 max-w-[50%] p-5">
    <div class="flex font-extrabold text-3xl text-white">
      Immersion in the last 30 days
    </div>
    <div class="font-extrabold text-gray-400">
      {{ dateString }}
    </div>
    <div class="flex">
      <!-- Left Section -->
      <div class="flex flex-col px-5 flex-1 justify-center">
        <!-- Title -->
        <div class="flex flex-col justify-center w-fit gap-5">
          <!-- ApexCharts Section -->
          <div
            class="flex flex-col items-center justify-center flex-none relative"
          >
            <div class="absolute flex flex-col items-center">
              <div class="font-bold text-xl 1820:text-2xl text-white">
                {{ totalHours }} hours
              </div>
              <div class="text-sm 1820:text-lg">
                From {{ props.sources.length }}
                {{ pluralize("source", props.sources.length) }}
              </div>
            </div>
            <div class="w-full h-full">
              <ApexCharts
                type="donut"
                :options="options"
                :series="series"
                @click.stop
              />
            </div>
          </div>
        </div>
      </div>

      <!-- List Section -->
      <div
        class="text-white flex flex-col justify-center w-full overflow-hidden mt-5"
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
            class="w-3 h-3 rounded-full min-w-3"
          />
          <p
            class="text-ellipsis overflow-hidden whitespace-nowrap text-sm font-normal"
          >
            {{ x.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
