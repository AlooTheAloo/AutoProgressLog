<script setup lang="ts">
    import MatureCards from "/Icons/MatureCards.png"
    import { activity } from "../../types/report-data"
    import { computed } from "vue";
    import dayjs from "dayjs";

    const limit = 6;

    interface ImmersionLogProps{
        log: activity[];
    }
    const props =defineProps<ImmersionLogProps>();


    const hrTotal = computed(() => {
        console.log(props.log.reduce((a, b) => a + b.activitySeconds, 0));
        return dayjs.duration(props.log.reduce((a, b) => a + b.activitySeconds, 0), "second").format("HH:mm:ss");
    })
    const sortedActivities = computed(() => {
        const sorted = [...props.log].sort((a, b) => b.activitySeconds - a.activitySeconds);

        if (sorted.length <= limit) return sorted;

        const bottomActivitiesSeconds = sorted.slice(limit).reduce((a, b) => a + b.activitySeconds, 0);
        const othersActivity = {
            activityTitle: `${sorted.length - limit} others`,
            activityDurationHR: dayjs.duration(bottomActivitiesSeconds, "s").format("HH:mm:ss"),
            activitySeconds: bottomActivitiesSeconds
        };

        return [...sorted.slice(0, limit), othersActivity];
    });


    

</script>

<template>
   <div class="rounded-xl flex w-full bg-black h-[331px]">
        <div class="w-full flex items-center px-7 flex-col ">
            <div class="pl-1 flex flex-col w-full pt-5 ">
                <div class="flex">
                    <div class=" flex flex-col flex-grow  ">
                        <div class="flex flex-col  ">
                            <div class="font-normal tracking-wider">
                                Immersion Log
                            </div>
                            <div class="font-extrabold text-3xl">
                                <div class=" flex flex-row">
                                    <div>
                                        {{
                                            hrTotal
                                        }}
                                    </div>
                                </div>
                            </div>
                        </div>
                     
                    </div>
                    <div class="w-10">
                        <img v-bind:src="MatureCards">
                    </div>
                </div>                
            </div>
            <div class="w-full flex-grow">
                <div class="divide-y divide-[#283B2C] w-full flex flex-col">
                    <div v-for="(item, index) in sortedActivities" :key="index" class="h-[35px] flex flex-col ">
                        <div class="gap-2 flex flex-grow items-center w-full font-bold text-sm">
                            <div class="flex-grow">
                                {{ 
                                    item.activityTitle
                                }}
                            </div>
                            <div>
                                {{ 
                                    item.activityDurationHR
                                 }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
   </div>
</template>