<script setup lang="ts">
import { ref } from 'vue';
import help from "../../../assets/Icons/help.png"
import DatePicker from 'primevue/datepicker';

const props = defineProps<{
    label:string,
    value?:Date,
    password?:boolean,
    options?:any,
    disabled?:boolean,
    placeholder?:string,
    helpText?:string,
}>()

const emit = defineEmits(['update:value']);

function updateValue(value:any){
    emit("update:value", value);
}

const value = ref<Date>(props.value ?? new Date());

</script>

<template>
    <div class="flex items-center gap-10 w-full h-12 ">
        <div class="flex h-full items-center gap-2 w-64">
            <p>
                {{ 
                    label
                }}    
            </p>
            <div class=" h-full w-4">
                <img v-if="props.helpText != undefined" v-tooltip.top="props.helpText" place :src="help" class="h-4 w-4 mt-2"/>
            </div>
        </div>
        <DatePicker 
            :disabled="disabled"
            @update:model-value="updateValue"
            hour-format="12"
            class=" h-12" id="datepicker-timeonly" :default-value="props.value" timeOnly />
    </div>
</template>