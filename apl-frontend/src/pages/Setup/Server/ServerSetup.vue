
<script setup lang="ts">
    import { useRoute, useRouter } from 'vue-router';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import { onMounted, ref, useModel, watch } from 'vue';
    import InputNumber from 'primevue/inputnumber';
    import Logo from "../../../assets/Logo.png";
    import { useWindowSize } from '@vueuse/core'
    const router = useRouter()
    import Dropdown from 'primevue/dropdown';
    import DatePicker from 'primevue/datepicker';
    import dayjs from 'dayjs';
    import Button from 'primevue/button';
import BackButton from '../../../components/Common/BackButton.vue';


    interface TimeOption {
        label: string
    }

    const timeOptions: TimeOption[] = [
        {
            label: "Day",
        },
        {
            label: "Week",
        }
        ,
        {
            label: "Month",
        }
    ]

    const selectedNumber = defineModel<number>('number')
    const selectedtimeOption = defineModel<TimeOption>('timeOption')
    const selectedTime = defineModel<Date>('time')

    onMounted(() => {
        selectedNumber.value = 1;
        selectedtimeOption.value = timeOptions[0];
        selectedTime.value = dayjs().startOf("day").toDate();
    })

    const { width, height } = useWindowSize();

    function Confirm(){
        const dayjsTime = dayjs(selectedTime.value);
        window.ipcRenderer.invoke("set-server-options", {
            generationTime: {
                hours: dayjsTime.hour(),
                minutes: dayjsTime.minute()
            },
            generationInterval: {
                intervalType: (selectedtimeOption.value ?? timeOptions[0]).label,
                intervalNumber: selectedNumber.value
            }
        }).then(() => {
            router.push('/setup/toggl-home');
        })
    }
</script>

<template>

        <SetupBackground/>



        <div class=" flex w-screen">
            <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
                <div v-if="height > 650">
                    <img :src="Logo" class=" w-12 h-12">
                </div>
                <div class="flex flex-col flex-grow justify-between gap-2 text-left py-10 ">
                    <div>
                        <BackButton route="/setup/client-server-selection"/>
                        <div class="font-semibold text-4xl text-white">
                            At what time and how often will the reports be generated ?
                        </div>
                        <div class="text-gray-600 font-light mb-5 text-xs lg:text-sm">
                            Reports will be generated automatically at a predetermined specific time interval. If your computer is turned off or disconnected from the internet, the reports will not be generated.
                            You can change this in the settings later.
                        </div>
                        <div class="flex flex-col gap-4 max-w-[35rem] w-full">
                            <div class="flex gap-2 items-center ">
                                <div class="text-lg font-semibold">
                                    Every
                                </div>
                                <div class="text-lg font-semibold flex-grow">
                                    <InputNumber class=" h-12" v-model="selectedNumber" :min="1" :max="30" inputId="integeronly" fluid showButtons>
                                        
                                    </InputNumber>
                                </div>
                                <div class="text-lg font-semibold">
                                    <Dropdown class=" h-12" v-model="selectedtimeOption" :options="timeOptions">
                                        <template #option="slotProps">
                                            <div class="flex align-items-center">
                                                {{ slotProps.option.label }}{{ (selectedNumber ?? 1) > 1 ? 's' : '' }}
                                            </div>
                                        </template>
    
                                        <template #value="slotProps">
                                            <div v-if="slotProps.value != undefined">
                                                {{ slotProps.value.label }}{{ (selectedNumber ?? 1) > 1 ? 's' : '' }}
                                            </div>
                                        </template>
    
    
                                    </Dropdown>
                                </div>
                            </div>
                            <div class="items-center gap-2 flex">
                                <div class="text-lg font-semibold">
                                    At
                                </div>
                                <div class=" flex-grow">
                                    <DatePicker 
                                    hour-format="12"
                                    class=" h-12" id="datepicker-timeonly" v-model="selectedTime" timeOnly fluid />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end mt-5 w-full ">
                        <Button label="Confirm" @click="Confirm"/>
                    </div>
                    
                </div>
            </div>
        </div>


        
</template>