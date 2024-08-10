<script setup lang="ts">
    defineProps<ScoreRowProps>();

    interface ScoreRowProps{
        title:string,
        value:number,
        isTotal?:boolean,
        isMultiplier?:boolean
    }

</script>

<template>
    <div class="flex flex-row text-lg"  :class="{ 'pt-6 pb-3': isTotal, 'py-3.5': !isTotal }">
        <div class="flex-grow " :class="{ 'text-[1.5rem] font-black': isTotal, 'text-[1.15rem] font-semibold': !isTotal }">
            {{ title }}
        </div>
        <div class="flex" :class="{ ' text-xl': isTotal }">
            <div v-if="!isTotal && !isMultiplier">
                + 
            </div> 
            <div v-if="isMultiplier">
                x
            </div>

            <div class="w-1"></div>
                
            <div :class="{ 'text-[1.5rem] font-black': isTotal, 'text-[1.15rem] font-semibold': !isTotal }">
                {{ value }}
            </div>
        </div>
    </div>
</template>