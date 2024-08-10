
<script setup lang="ts">
    import Time from "/Icons/Time.png"
    import { TPlusDelta } from "../../types/report-data"
    import SmallWidget from "../SmallWidget.vue"
    interface TotalTimeProps{
        time: TPlusDelta<number>;
    }
    defineProps<TotalTimeProps>();
    

</script>

<template>
    <SmallWidget title="Total immersion time" units="hours" :image="Time" :value="{ 
        current:time.current,
        delta:time.delta
      }"></SmallWidget>
</template>