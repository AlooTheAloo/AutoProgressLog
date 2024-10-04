
<script setup lang="ts">
    import { computed } from "vue";
    import Delta from "../Common/Delta.vue"
    import { abbreviateNumber } from "js-abbreviation-number";
    import { TPlusDelta } from "../../../types/Util";
    import {roundTo} from "round-to";

    interface SmallWidgetProps{
        value: TPlusDelta<any>;
        title:string,
        units?:string,
        condense?:boolean,
        image:string,
        direction:number,
        hideDelta?:boolean
    }

    const hrValue = computed(() => {
        return props.condense ? abbreviateNumber(roundTo(props.value.current, 2), 2) : props.value.current
    })


    const props = defineProps<SmallWidgetProps>();
</script>

<template>
  <div class="w-96 h-36 bg-black rounded-xl flex items-center justify-center text-white">
    
    <div class="flex w-4/5 justify-center h-20 ">
        <div class="flex-grow flex flex-col justify-center">
            <div class="font-normal tracking-wider flex items-center gap-2 ">
                <img class=" w-5 h-5" v-bind:src="image">
                {{ title }}
            </div>
            <div class="font-extrabold text-2xl" v-if="!hideDelta">
                <div class=" flex flex-row gap-3">
                    <div>
                        {{ hrValue }} {{ units ?? "" }}
                    </div>
                    <div class="flex-grow flex items-center">
                        <Delta v-bind:direction="direction" :delta="value.delta"></Delta>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>