<script setup lang="ts">
import ApexCharts from "vue3-apexcharts";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
const options: ApexOptions = {
  colors: [],

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
      columnWidth: "15px",
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
  },

  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
};

const series = [
  {
    data: [1, 2, 2.12, 0.2, 1, 1.5, 2],
  },
];
</script>

<template>
  <div class="flex flex-col bg-black rounded-lg w-0 flex-grow pt-5">
    <div class="flex font-extrabold 1820:text-2xl text-xl text-white px-5">
      Immersion Streak
    </div>
    <div class="font-extrabold text-gray-400 px-5 1820:text-lg text-sm">
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
