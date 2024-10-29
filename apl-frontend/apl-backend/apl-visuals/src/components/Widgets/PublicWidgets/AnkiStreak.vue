<script lang="ts" setup>
import { ReportData } from '../../../types/report-data';
import TimeMap from '../TimeMap.vue';

    interface AnkiDataProps{
        reportData:ReportData
    }

    defineProps<AnkiDataProps>();

</script>
<template>
    <div class="flex-grow ">
        <TimeMap title="Anki Streak" :streak="reportData.AnkiStreak" :data="reportData.AnkiData" ></TimeMap>
    </div>
</template>