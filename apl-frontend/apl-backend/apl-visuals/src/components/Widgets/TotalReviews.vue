<script setup lang="ts">
    import Reviews from "/Icons/TotalReviews.png"
    import { TPlusDelta } from "../../types/report-data"
    import SmallWidget from "../SmallWidget.vue"
    interface TotalReviewProps{
        reviews: TPlusDelta<number>;
    }
    const props = defineProps<TotalReviewProps>();
</script>

<template>
    <SmallWidget title="Total Reviews" v-bind:condense="true" :image="Reviews" :value="{ 
        current:props.reviews.current,
        delta:props.reviews.delta
      }"></SmallWidget>
</template>