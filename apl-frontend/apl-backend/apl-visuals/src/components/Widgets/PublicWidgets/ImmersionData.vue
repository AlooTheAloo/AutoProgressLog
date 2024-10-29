  <script lang="ts" setup>
    import { ReportData } from '../../../types/report-data';
import AverageTime from '../AverageTime.vue';
import TotalTime from '../TotalTime.vue';

    interface AnkiDataProps{
        reportData:ReportData
    }

    defineProps<AnkiDataProps>();

</script>
<template>
    <div class=" flex gap-5">
        <TotalTime :time="reportData.ImmersionTime"></TotalTime>
        <AverageTime :time="reportData.AverageImmersionTime"></AverageTime>
    </div>
</template>