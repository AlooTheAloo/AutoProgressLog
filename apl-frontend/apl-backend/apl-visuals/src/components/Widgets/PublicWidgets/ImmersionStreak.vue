<script lang="ts" setup>
    import { ReportData } from '../../../types/report-data';
    import TimeMap from '../TimeMap.vue';

    interface ImmersionDataProps{
        reportData:ReportData
    }

    const props = defineProps<ImmersionDataProps>();

</script>
<template>
    <div class="">
        <TimeMap title="Immersion Streak" :streak="props.reportData.ImmersionStreak" :data="props.reportData.ImmersionData" ></TimeMap>
    </div>
</template>