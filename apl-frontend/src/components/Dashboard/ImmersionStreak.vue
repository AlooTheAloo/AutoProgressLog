<script setup lang="ts">
import ApexCharts from "vue3-apexcharts";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import { computed, onMounted, ref } from "vue";
import { watch } from "fs";
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
    labels: {
      style: {
        colors: "#fff",
      },
      formatter: (value: any) => {
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
  },
  tooltip: {
    enabled: false,
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
    class="flex flex-col bg-black rounded-lg w-0 flex-grow pt-5 overflow-hidden"
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
            <div class="w-full h-full pointer-events-none">
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
