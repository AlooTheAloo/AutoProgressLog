<script lang="ts" setup>
import { ReportData } from '../../../types/report-data';
import TimeMap from '../TimeMap.vue';

    interface AnkiDataProps{
        reportData:ReportData
    }

    const props = defineProps<AnkiDataProps>();

</script>
<template>
    <div class="flex-grow ">
        <TimeMap title="Anki Streak" :streak="props.reportData.AnkiStreak" :data="props.reportData.AnkiData" ></TimeMap>
    </div>
</template>