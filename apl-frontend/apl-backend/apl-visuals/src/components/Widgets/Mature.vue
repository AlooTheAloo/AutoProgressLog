<script setup lang="ts">
    import Delta from "../Delta.vue"
    import MatureCards from "/Icons/MatureCards.png"
    import {TPlusDelta, matureCardData } from "../../types/report-data"
    import { ComputedRef, computed, ref } from "vue";
    import pluralize from "pluralize";
    
    interface MatureProps{
        data: matureCardData[];
    }
    
    const props = defineProps<MatureProps>();
    const sortedDataByReport = ref(props.data.toSorted((a, b) => b.reportNo - a.reportNo));
    const sortedDataByMature = ref(props.data.toSorted((a, b) => b.matureCardCount - a.matureCardCount));
    
    const value:ComputedRef<TPlusDelta<number>> = computed(() => {
        const cur = sortedDataByReport.value[0].matureCardCount;
        return {
            current: cur,
            delta: sortedDataByMature.value.length < 2 ? cur : cur - sortedDataByReport.value[1].matureCardCount
        }
    })

    const lineData = computed(() => {
        const max = sortedDataByMature.value[0];
        const min = sortedDataByMature.value.at(-1);
        if(min == undefined) return;
        const delta = max.matureCardCount - min.matureCardCount;
        let lineValue = Math.ceil(delta / bgGradient.length) 
        lineValue = lineValue == 0 ? 1 : lineValue;

        return ({
            lines : sortedDataByReport.value.map(x => {
                const lineNumber = Math.ceil((x.matureCardCount - (min.matureCardCount - lineValue)) / lineValue);
                return {
                    reportNo: x.reportNo,
                    lineNumber: lineNumber == 0 ? 1 : lineNumber
                }
            }),
            graphMinVal : min.matureCardCount - lineValue,
            graphMaxVal : (min.matureCardCount - lineValue) + bgGradient.length * lineValue,
            lineValue : lineValue  
        });
    });

    const bgGradient = ["#61BC50", "#65C454", "#69CD57", "#6ED45B", "#6DD65A", "#73E35F", "#7AE968", "#7FF16C", "#8CFF79"]

</script>

<template>
   <div class="rounded-xl flex w-full bg-black h-[20.7rem]">
        <div class="w-full flex justify-center ">
            <div class="pl-1 flex flex-col w-[91.7%]   pt-5 ">
                <div class="flex flex-grow">
                    <div class=" flex flex-col ">
                        <div class="flex flex-col  ">
                            <div class="font-normal tracking-wider">
                                Total mature cards
                            </div>
                            <div class="font-extrabold text-3xl">
                                <div class=" flex flex-row">
                                    <div>
                                        {{
                                            pluralize("card", value.current, true)
                                        }} 
                                    </div>
                                    <div class="flex-grow">
                                        <Delta v-bind:delta="value.delta"></Delta>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col my-3 flex-grow w-[111.5%]  ">
                            <div class="divide-y divide-[#283B2C] flex-grow">
                                <div v-for="(item, index) in lineData?.lines" :key="index" class="h-[35px] flex flex-col ">
                                    <div class="justify-center gap-2 flex flex-grow items-center font-bold text-sm">
                                        <div>
                                            {{ 
                                                item.reportNo
                                            }}
                                        </div>
                                        <div v-for="index in bgGradient.length" :key="index" class="rounded-full w-[45px] h-[10px]" :style="{
                                            backgroundColor: (index <= item.lineNumber ? bgGradient[index - 1] : '#434342'), 
                                            boxShadow: (index <= item.lineNumber ? '0px 0px 20px 3px ' + bgGradient[index - 1] + '6B' : 'none')
                                        }">
                                            
                                        </div>


                                    </div>
                                </div>
                            </div>
                            <div class="text-[#68565F] text-xs mt-5 text-center " v-if="(lineData?.lines.length ?? 0) > 1">
                                Every bar represents {{ pluralize("mature card", lineData?.lineValue, true) }}
                                <br>
                                Chart represents {{ lineData?.graphMinVal }} → {{ pluralize("card", lineData?.graphMaxVal, true) }} 
                            </div>
                        </div>
                    </div>
                    <div class="h-[4.5rem] flex flex-col ">
                        <div class="w-10 ml-[0.65rem] ">
                            <img v-bind:src="MatureCards">
                        </div>
                    </div>
                </div>                
            </div>
        </div>
   </div>
</template>