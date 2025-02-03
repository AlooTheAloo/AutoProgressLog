
<script setup lang="ts">
    import AverageTime from "/Icons/AverageTime.png"
    import { TPlusDelta } from "../../types/report-data"
    import SmallWidget from "../SmallWidget.vue"
    import { computed } from "vue";
    import formatTime from "../../util/timeFormat";
    
    const hrCurrent = computed(() => {
        return formatTime(props.time.current)
    })

    const negative = computed(() => {
        return props.time.delta < 0;
    })

    const hrDelta = computed(() => {
        if(props.time.delta == undefined || Math.abs(props.time.delta) < 1) {
            return 0;
        }

        return formatTime(Math.abs(props.time.delta));
    })

    interface AverageTimeProps{
        time: TPlusDelta<number>;
    }
    const props = defineProps<AverageTimeProps>();
</script>

<template>
    <SmallWidget title="Average immersion time" 
    v-bind:deltaOverride="(negative) ? -1 : (hrDelta == 0 ? 0 : 1)"
    :image="AverageTime" :value="{ 
        current:hrCurrent,
        delta:hrDelta,
      }" 
    ></SmallWidget>
</template>