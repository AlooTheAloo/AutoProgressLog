<script setup lang="ts">
import Calendar from "/Icons/BestTime.png";
import SmallWidget from "../SmallWidget.vue";
import { TPlusDelta } from "../../types/report-data";
import formatTime from "../../util/timeFormat";

interface BestTimeProps {
  time: TPlusDelta<number>;
}
const props = defineProps<BestTimeProps>();
</script>

<template>
  <SmallWidget
    title="Best Immersion Time"
    units=""
    :image="Calendar"
    :value="{
      current: formatTime(Math.abs(props.time.current)),
      delta: 0,
    }"
    :hide-delta="true"
    :new-best="props.time.delta != 0"
  ></SmallWidget>
</template>
