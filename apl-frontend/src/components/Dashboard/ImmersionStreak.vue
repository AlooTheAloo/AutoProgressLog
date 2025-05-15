<script setup lang="ts">
import ApexCharts from "vue3-apexcharts";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import { computed, onMounted, ref } from "vue";
import { watch } from "fs";

const CHART_COLORS = [
  "#22C8CD",
  "#8B61D0",
  "#72ED7E",
  "#F74E8F",
  "#FF8329",
  "#FFCB03",
  "#FF3B3B",
];

const options: ApexOptions = {
  colors: [],
  grid: {
    borderColor: "#555",
    strokeDashArray: 3,
  },
  yaxis: {
    labels: {
      style: {
        colors: "#fff",
      },
      formatter: (value) => {
        return value + "h";
      },
    },
  },
  xaxis: {
    tickAmount: 6,
    labels: {
      style: {
        colors: "#fff",
      },
      formatter: (value: any, i) => {
        return dayjs().subtract(value, "day").format("ddd");
      },
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 7.5,
      distributed: true,
      columnWidth: "45%",
      barHeight: "10px",
    },
  },
  fill: {
    opacity: 100,
    colors: CHART_COLORS,
  },
  tooltip: {
    custom: function ({
      seriesIndex,
      dataPointIndex,
    }: {
      seriesIndex: number;
      dataPointIndex: number;
    }) {
      {
        return `
        <div class="flex flex-col gap-2 bg-gray-900 ">
            <div class="flex flex-row   gap-2 items-center p-2">
                <div class="w-3 h-3 rounded-full" style="background-color: ${
                  CHART_COLORS[dataPointIndex]
                }"></div>
            <p class="text-ellipsis overflow-hidden whitespace-nowrap text-sm font-normal">
      ${series.value[seriesIndex].data[dataPointIndex].toFixed(2)} hours
            </p>
        </div>`;
      }
    },
  },
  chart: {
    type: "bar",
    animations: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
    width: "900px",
    zoom: {
      enabled: false,
    },
  },
  states: {
    hover: {
      filter: {
        type: "none",
      },
    },
    active: {
      filter: {
        type: "none",
      },
    },
  },

  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
};

const props = defineProps<{
  streak: number[];
}>();

const series = computed(() => {
  return [
    {
      data: props.streak,
    },
  ];
});
</script>

<template>
  <div
    class="flex flex-col bg-black rounded-lg w-0 flex-grow pt-5 overflow-hidden border-2 border-transparent hover:border-[#22A7D1] trantiton-all duration-200"
  >
    <div class="flex font-extrabold 1720:text-2xl text-xl text-white px-5">
      Immersion Time
    </div>
    <div class="font-extrabold text-gray-400 px-5 1720:text-lg text-sm">
      From the last 7 days
    </div>
    <div class="flex flex-grow">
      <!-- Left Section -->
      <div class="flex flex-col px-5 justify-center w-full h-full">
        <!-- Title -->
        <div class="flex flex-col justify-center gap-5 w-full h-full">
          <!-- ApexCharts Section -->
          <div
            class="h-full flex flex-col items-center justify-center flex-none relative"
          >
            <div class="w-full h-full">
              <ApexCharts
                height="100%"
                width="100%"
                type="bar"
                :options="options"
                :series="series"
                @click.stop
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.apexcharts-tooltip.apexcharts-theme-light {
  border: 0 !important;
}
</style>
