
<script setup lang="ts">
    import AverageTime from "/Icons/AverageTime.png"
    import { TPlusDelta } from "../../types/report-data"
    import SmallWidget from "../SmallWidget.vue"
    import dayjs from "dayjs";
    import duration from 'dayjs/plugin/duration'
    import { computed } from "vue";
    dayjs.extend(duration);


    const hrCurrent = computed(() => {
        return dayjs.duration(props.time.current, "second").format("HH:mm:ss");
    })

    const hrDelta = computed(() => {
        return dayjs.duration(props.time.delta, "second").format("HH:mm:ss");
    })

    interface AverageTimeProps{
        time: TPlusDelta<number>;
    }
    const props = defineProps<AverageTimeProps>();
</script>

<template>
    <SmallWidget title="Average immersion time" 
    v-bind:deltaOverride="props.time.delta == 0 ? 0 : 1"
    :image="AverageTime" :value="{ 
        current:hrCurrent,
        delta:hrDelta,
      }" 
    ></SmallWidget>
</template>