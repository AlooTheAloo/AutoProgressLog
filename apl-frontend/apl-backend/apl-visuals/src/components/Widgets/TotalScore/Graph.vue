
<script setup lang="ts">
    import ApexCharts from 'vue3-apexcharts';
    import { ReportData } from "../../../types/report-data";
    import { chartOptions } from "./graphOptions";

    const props = defineProps<{data: ReportData}>();

    const series:ApexAxisChartSeries[] = [
       {
           name: 'series-1',
           data: props.data.lastDaysPoints,
       } as any // workaround for ApexCharts
    ];


</script>

<template>
    <div v-if="props.data.lastDaysPoints.length < 10" class=" h-full w-full text-xl text-center flex items-center justify-center text-gray-400">
        <p>
            A graph will appear here starting <br>
            at the 10th report
        </p>
    </div>

    <ApexCharts
        class="mt-[3.75rem]"    
        v-else
        height="330"
        width="590"
        type="area"
        :options="chartOptions(props.data)"
        :series="series"/>
</template>