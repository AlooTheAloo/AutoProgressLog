<script lang="ts" setup>
    import { ReportData } from '../../../types/report-data';
    import TimeMap from '../TimeMap.vue';

    interface ImmersionDataProps{
        reportData:ReportData
    }

    defineProps<ImmersionDataProps>();

</script>
<template>
    <div class="">
        <TimeMap title="Immersion Streak" :streak="reportData.ImmersionStreak" :data="reportData.ImmersionData" ></TimeMap>
    </div>
</template>