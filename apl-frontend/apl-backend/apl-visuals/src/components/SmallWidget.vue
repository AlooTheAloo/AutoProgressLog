
<script setup lang="ts">
    import { computed } from "vue";
    import { TPlusDelta } from "../types/report-data"
    import Delta from "./Delta.vue"
    import { abbreviateNumber } from "js-abbreviation-number";

    interface SmallWidgetProps{
        value: TPlusDelta<any>;
        title:string,
        units?:string,
        condense?:boolean,
        image:string,
        deltaOverride?:number,
        hideDelta?:boolean
    }

    const hrValue = computed(() => {
        return props.condense ? abbreviateNumber(props.value.current, 2) : props.value.current
    })


    const props = defineProps<SmallWidgetProps>();
</script>

<template>
  <div class="w-72 h-36 bg-black rounded-xl flex flex-grow items-center justify-center">
    <div class="h-36 w-72 flex justify-end pr-5 absolute">
        <div class=" mt-5 w-10">
            <img v-bind:src="image">
        </div>
    </div>
    <div class="flex w-4/5 justify-center h-20 ">
        <div class="flex-grow flex flex-col justify-center">
            <div class="font-normal tracking-wider">
                {{ title }}
            </div>
            <div class="font-extrabold text-3xl" v-if="!hideDelta">
                <div class=" flex flex-row">
                    <div>
                        {{ hrValue }} {{ units ?? "" }}
                    </div>
                    <div class="flex-grow">
                        <Delta v-bind:override="deltaOverride" :delta="value.delta"></Delta>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>