<script setup lang="ts">
import DatePicker from 'primevue/datepicker';
import { Options } from '../../../../apl-backend/types/options';
import SettingsToggle from '../Common/SettingsToggle.vue';
import help from "../../../assets/Icons/help.png"
import { ref } from 'vue';
import { watch } from 'vue';
import SettingsDatePicker from '../Common/SettingsDatePicker.vue';

const props = defineProps<{
    config:Options|undefined
}>()

// type-based
const emit = defineEmits<{
  (e: 'update:config', config: Options): void
}>()

const selectedTime = ref<Date|undefined>()

watch(props,() => {
    console.log("On mounted");
    console.log(props.config);
    const time = props.config?.general.autogen.options?.generationTime;
    if(time == undefined) return;
    const date = new Date();
    date.setHours(time.hours);
    date.setMinutes(time.minutes);
    console.log(date);
    selectedTime.value = date;
    console.log(selectedTime.value);
})

function updateTime(value:Date){
    if(props.config == undefined) return;
    emit('update:config', 
    !props.config.general.autogen.enabled ? {
        ...props.config,
        general:{
            ...props.config.general,
            autogen: {
                enabled: false,
            }
        }
    } :
    {
        ...props.config, 
        general:{
        ...props.config?.general, 
        autogen:{
            enabled: props.config?.general.autogen.enabled, 
            options:{
                ...props.config?.general.autogen.options, 
                generationTime:{
                    hours: value.getHours(), 
                    minutes: value.getMinutes()
                }
            }
        }
    }})
     
}


</script>

<template>  
    <div class="flex flex-col w-full gap-2" v-if="config != undefined">
        <SettingsToggle :value="config.general.autogen.enabled" 
        label="Automatic Report Generation" 
        help-text="Automatically generate reports at a predetermined time interval. If your computer is turned off or disconnected from the internet, the reports will not be generated."
        @update:value="$emit('update:config', {...config, general:{...config.general, autogen:{...config.general.autogen, enabled: $event}}})"
        />

        <div class="flex items-center gap-10 w-full ">
            <SettingsDatePicker :value="selectedTime" label="Time to Generate Reports" @update:value="updateTime"
            :disabled="!props.config?.general.autogen.enabled"

            help-text="The time at which reports will be generated every day"
            />
            <!-- <div class="flex h-12 items-center gap-2 w-64">
                <p>
                    Time to Generate Reports
                </p>
                <div class=" h-full w-4">
                    <img v-tooltip.top="'The time at which reports will be generated every day'" place :src="help" class="h-4 w-4 mt-2"/>
                </div>
            </div>
            <div class="flex ">
    
            </div>
            <DatePicker 
            :disabled="!props.config?.general.autogen.enabled"
            @update:model-value="updateTime"
            hour-format="12"
            class=" h-12" id="datepicker-timeonly" v-model="selectedTime" timeOnly />
     -->
    
        </div>
       
       

    </div>    
</template>