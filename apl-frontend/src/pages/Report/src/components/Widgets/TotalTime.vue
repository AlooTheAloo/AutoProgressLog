<script setup lang="ts">
import Time from "../../../public/Icons/Time.png";
import { TPlusDelta } from "../../types/report-data";
import SmallWidget from "../SmallWidget.vue";
interface TotalTimeProps {
  time: TPlusDelta<number>;
}
const props = defineProps<TotalTimeProps>();
</script>

<template>
  <SmallWidget
    title="Total immersion time"
    units="hours"
    :image="Time"
    :value="{
      current: (props.time.current / 3600).toFixed(1),
      delta: (props.time.delta / 3600).toFixed(1),
    }"
  ></SmallWidget>
</template>
