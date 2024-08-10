
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
    <ApexCharts
        height="330"
        width="590"
        type="area"
        :options="chartOptions(props.data)"
        :series="series"/>
</template>