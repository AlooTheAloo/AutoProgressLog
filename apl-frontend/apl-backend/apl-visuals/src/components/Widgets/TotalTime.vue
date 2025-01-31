
<script setup lang="ts">
    import Time from "/Icons/Time.png"
    import { TPlusDelta } from "../../types/report-data"
    import SmallWidget from "../SmallWidget.vue"
    interface TotalTimeProps{
        time: TPlusDelta<number>;
    }
    const props = defineProps<TotalTimeProps>();
    

</script>

<template>
    <SmallWidget title="Total immersion time" units="hours" :image="Time" :value="{ 
        current:props.time.current,
        delta:props.time.delta
      }"></SmallWidget>
</template>