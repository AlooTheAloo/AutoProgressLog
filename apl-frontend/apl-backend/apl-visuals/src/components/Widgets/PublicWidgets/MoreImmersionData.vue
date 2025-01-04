<script lang="ts" setup>
import { ReportData } from '../../../types/report-data';
import AverageTime from '../AverageTime.vue';
import MonthImmersion from '../MonthImmersion.vue';

interface AnkiDataProps{
    reportData:ReportData
}

defineProps<AnkiDataProps>();

</script>
<template>
<div class=" flex gap-5">
    <MonthImmersion :time="reportData.ImmersionTime"></MonthImmersion>
    <AverageTime :time="reportData.AverageImmersionTime"></AverageTime>
</div>
</template>