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

const limit = ref<number>(4);
const props = defineProps<{
  sources: ImmersionSource[];
  lastSyncTime?: string;
}>();

const totalHours = computed(() => {
  return (
    props.sources.reduce((acc, x) => acc + x.relativeValue, 0) / 3600
  ).toFixed(2);
});

const computedSources = ref<DashboardImmersionSource[]>([]);

watchEffect(() => {
  computedSources.value = [...props.sources].sort((a, b) => b.relativeValue - a.relativeValue)
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
  const reference = props.lastSyncTime ? dayjs(props.lastSyncTime) : dayjs();
  const start = reference.subtract(30, "days");
  const end = reference;

  return `Data from ${start.format("D MMM YYYY")} - ${end.format(
    "D MMM YYYY"
  )}`;
});

const sortedSources = computed(() => {
  const sort = [...computedSources.value].sort(
    (a, b) => b.relativeValue - a.relativeValue
  );
  const bottomActivitiesSeconds = sort
    .slice(limit.value)
    .reduce((a, b) => a + b.relativeValue, 0);
  let arr = [...sort.slice(0, limit.value)];
  if (sort.length > limit.value) {
    arr.push({
      name: `${sort.length - limit.value} other${sort.length - limit.value > 1 ? "s" : ""
        }`,
      relativeValue: bottomActivitiesSeconds,
      enabled: true,
      colorIndex: 727,
    });
  }
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
  "#8B61D0",
  "#73D562",
  "#D57AFF",
  "#F74E8F",
  "#FF964F"
);

const options: ComputedRef<ApexOptions> = computed(() => {
  const ret: ApexOptions = {
    chart: {
      width: 280,
      // ApexCharts TypeScript types are incomplete and lack animateGradually/dynamicAnimation fields,
      // so cast is required to avoid type errors while still using these documented animation options
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      } as any,
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
          size: "85%",
          labels: {
            show: false,
          },
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
          const safeName = value.name
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
          return `<div class="flex flex-col gap-2 bg-white dark:bg-gray-900 text-black dark:text-white p-2 rounded shadow-lg">
              <div class="flex flex-row gap-2 items-center">
                  <div class="w-3 h-3 rounded-full" style="background-color: ${colors.value[seriesIndex]}"></div>
                  <span class="font-bold">${safeName}</span>
              </div>
              <div class="text-sm">${value.hr}</div>
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

const series = computed(() => {
  return sortedSources.value.map((x) => x.relativeValue);
});
</script>

<template>
  <div
    class="flex flex-col h-full text-black dark:text-white bg-[#ebebec] dark:bg-black rounded-lg pt-5 pb-5 border-2 border-transparent hover:border-[var(--primary-color)] transition-all duration-200 flex-1 min-w-0 overflow-hidden ">
    <div class="px-10 h-full flex flex-col">
      <div class="font-extrabold text-lg 1720:text-2xl">
        Immersion in the last 30 days
      </div>
      <div class="font-bold text-gray-600 dark:text-gray-400 text-sm">
        {{ dateString }}
      </div>

      <div class="flex flex-1 items-center justify-center gap-16 w-full">
        <div class="relative flex items-center justify-center">

          <div class="absolute flex flex-col items-center pointer-events-none">
            <div class="font-extrabold text-3xl">
              {{ totalHours }} hours
            </div>
            <div class="font-bold text-gray-500 text-sm mt-1">
              From {{ props.sources.length }} {{ pluralize("source", props.sources.length) }}
            </div>
          </div>

          <ApexCharts width="280" type="donut" :options="options" :series="series" @click.stop />
        </div>

        <ul
          class="1720:flex hidden flex-col justify-center divide-y divide-dashed divide-gray-400/50 dark:divide-gray-600/50">
          <li v-for="(x, i) in sortedSources" :key="x.name" class="flex items-center justify-between py-3 gap-4">
            <div class="flex items-center gap-3 overflow-hidden">
              <div :style="{ backgroundColor: colors[i] }" class="w-6 h-3 rounded-full flex-shrink-0"></div>
              <span class="font-bold truncate text-base">
                {{ x.name }}
              </span>
            </div>
            <span class="font-bold whitespace-nowrap">
              {{ (x.relativeValue / 3600).toFixed(2) }} h
            </span>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>