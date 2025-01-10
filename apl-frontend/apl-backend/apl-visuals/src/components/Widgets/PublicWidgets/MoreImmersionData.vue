<script lang="ts" setup>
import { ReportData } from '../../../types/report-data';
import BestTime from '../BestTime.vue';
import MonthImmersion from '../MonthImmersion.vue';

interface AnkiDataProps{
    reportData:ReportData
}

defineProps<AnkiDataProps>();

</script>
<template>
<div class=" flex gap-5">
    <MonthImmersion :time="reportData.MonthlyImmersion"></MonthImmersion>
    <BestTime :time="reportData.BestImmersion"></BestTime>
</div>
</template>