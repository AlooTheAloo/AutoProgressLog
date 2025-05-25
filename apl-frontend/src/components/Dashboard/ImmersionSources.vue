<script setup lang="ts">
import ApexCharts from "vue3-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  computed,
  ComputedRef,
  onUnmounted,
  reactive,
  ref,
  watch,
  watchEffect,
} from "vue";
import dayjs from "dayjs";
import { NWayInterpol } from "../../util/n-way-interpol";
import { ImmersionSource } from "../../../electron/main/Electron-Backend/types/Dashboard";
import pluralize from "pluralize";
import formatTime from "../../util/timeFormat";
import { ThemeManager } from "../../util/theme-manager";

type DashboardImmersionSource = {
  name: string;
  relativeValue: number;
  enabled: boolean;
  colorIndex: number;
};

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

const reactiveSources = ref(props.sources);
watchEffect(() => {
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
});

const dateString = computed(() => {
  const now = dayjs();
  const start = now.subtract(30, "days");
  const end = now;

  return `Data from ${start.format("D MMM YYYY")} - ${end.format(
    "D MMM YYYY"
  )}`;
});

const sortedSources = computed(() => {
  console.log("time to sort" + computedSources.value);
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
  console.log("We're done !!" + arr);
  return arr
    .filter((x) => x.enabled)
    .map((x) => {
      return {
        name: x.name,
        relativeValue: x.relativeValue,
        hr: formatTime(x.relativeValue),
      };
    });
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

let gradient = new NWayInterpol(
  "var(--primary-color)",
  "#73D562",
  "#D57AFF",
  "#F74E8F",
  "#FF964F"
);

let options: ComputedRef<ApexOptions> = computed(() => {
  const ret: ApexOptions = {
    chart: {
      width: 300,
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
      hover: {
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
          return `<div class="flex flex-col gap-2 bg-white dark:bg-gray-900 text-black dark:text-white">
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

const theme = ref<string>(ThemeManager.getTheme());

const unsubscribe = ThemeManager.onThemeChange((newTheme) => {
  theme.value = newTheme;
});

onUnmounted(() => {
  unsubscribe();
});

let series /* Literally a calculus reference */ = computed(() => {
  return sortedSources.value.map((x) => x.relativeValue);
});
</script>

<template>
  <div
    class="flex flex-col text-black dark:text-white bg-[#ebebec] dark:bg-black rounded-lg w-0 flex-grow pt-5 border-2 border-transparent hover:border-[var(--primary-color)] trantiton-all duration-200"
  >
    <div class="flex font-extrabold 1720:text-2xl text-xl px-5">
      Immersion in the last 30 days
    </div>
    <div
      class="font-extrabold text-gray-600 dark:text-gray-400 px-5 1720:text-lg text-sm"
    >
      {{ dateString }}
    </div>
    <div class="flex items-center h-full">
      <!-- Left Section -->
      <div class="flex flex-col px-5 justify-center w-1/2">
        <!-- Title -->
        <div class="flex flex-col justify-center w-fit gap-5">
          <!-- ApexCharts Section -->
          <div
            class="flex flex-col items-center justify-center flex-none relative"
          >
            <div class="absolute flex flex-col items-center">
              <div class="font-bold text-xl 1720:text-2xl">
                {{ totalHours }} hours
              </div>
              <div class="text-sm 1720:text-lg">
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
      <ul
        class="min-w-[21.5rem] 1720:flex hidden divide-black/60 dark:divide-white/60 w-fit mr-4 divide-y divide-dashed dark:text-white text-black flex-col justify-center"
      >
        <li
          v-for="(x, i) in sortedSources"
          :key="x.name"
          class="flex flex-row items-center gap-3 py-2.5 truncate"
        >
          <div
            :style="{
              backgroundColor: colors[i],
            }"
            class="w-5 h-3 rounded-md min-w-5"
          />
          <p class="overflow-hidden truncate text-base font-normal flex-grow">
            {{ x.name }}
          </p>
          <p class="font-bold">{{ (x.relativeValue / 3600).toFixed(2) }} h</p>
        </li>
      </ul>
    </div>
  </div>
</template>
