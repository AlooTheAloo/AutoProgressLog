<script setup lang="ts">
    import upArrow from "../../public/Icons/Up-Arrow.svg" 
    import downArrow from "../../public/Icons/Down-Arrow.svg" 

    const props = defineProps<{
        delta: number|string;
        override?:number;
    }>();

</script>

<template>
    <div class="ml-[5px] pb-[2px] h-full flex items-end text-sm" :class="{'text-[#5FFFB2]' : (props.delta as number) > 0 || override == 1, 'text-gray-300' : (props.delta == 0 || override == 0), 'text-[#FF5F5F]' : (props.delta as number < 0) || override == -1}">
        <div class="h-[15px]" v-if="(props.delta as number) > 0 || override == 1">
            <img class=" pr-1 w-5" v-bind:src="upArrow">
        </div>
        <div class="h-[15px] pb-[17px]" v-else-if="(props.delta as number) < 0 || override == -1">
            <img class=" pr-1 w-5" v-bind:src="downArrow">
        </div>

        <div>
            {{
                (props.delta === 0 || override == 0) ? " No change" : props.delta
            }} 
        </div>
    </div>
</template>