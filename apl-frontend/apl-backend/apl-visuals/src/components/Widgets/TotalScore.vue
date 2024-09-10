
<script setup lang="ts">
    import ScoreRow from "./TotalScore/ScoreRow.vue"
    import rewarded from "/Icons/rewarded.png"
    import Graph from "./TotalScore/Graph.vue"
    import { ReportData } from "../../types/report-data";

    defineProps<{data: ReportData}>();

</script>

<template>
    <div class="rounded-xl flex w-full bg-black ">
        <div class="w-full flex  ">
            <div class="w-1/2 flex flex-col pt-7 px-5 pb-7">
                <div class=" flex font-semibold text-2xl">
                    Total Report Score               
                </div>
                <div class="flex flex-col divide-y divide-[#989898]">
                    <ScoreRow v-bind:title="`Immersion`" v-bind:value="data.ImmersionScore"/>
                    <ScoreRow v-bind:title="`Anki`" v-bind:value="data.AnkiScore"/>
                    <ScoreRow v-bind:title="`Total`" v-bind:value="data.TotalScore" isTotal/>
                </div>
                <div class="flex font-semibold text-2xl" v-if="data.UserRanking">
                    <div class="flex flex-row w-full bg-red-500 h-[4.5rem] mt-2 overflow-clip rounded-xl">
                       <div class=" flex h-full flex-col w-3/4 bg-white text-black text-[1rem] leading-6 justify-center pl-10 font-extrabold">
                           <div class="flex flex-row ">
                            Monthly User Ranking
                            </div>
                            <div class="">
                                {{ data.UserRanking }}
                            </div>
                       </div>
                       <div class="w-1/4 bg-[#24CAFF] flex justify-center items-center h-full">
                           <img v-bind:src="rewarded">
                       </div>   
                    </div>
                </div>
                <div class="h-[4.5rem]" v-else>

                </div>
            </div>
            <div class="w-1/2 flex-col flex justify-center">
                <div class="w-full px-5 font-semibold "/>
                <Graph :data="data"></Graph>
            </div>
        </div>
   </div>
</template>