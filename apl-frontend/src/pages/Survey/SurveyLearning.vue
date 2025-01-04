<script setup lang="ts">
    import { ES, JP, US, FR, DE, KR, CN, RU, IT, NE, PR, CZ, SA, HK, PH, PS, NO, ID, TH, AQ } from 'country-flag-icons/string/3x2'
    import Listbox from 'primevue/listbox';
    import Accordion from 'primevue/accordion';
    import AccordionPanel from 'primevue/accordionpanel';
    import AccordionHeader from 'primevue/accordionheader';
    import AccordionContent from 'primevue/accordioncontent';
    import Logo from '../../assets/Logo.png'
    import Button from 'primevue/button';
    import { useRouter } from 'vue-router';
    import { onMounted, ref, watch } from 'vue';
    import SelectButton from 'primevue/selectbutton';
    import { useWindowSize } from '@vueuse/core'

    const active = ref<string|undefined>('0');
    const panel = defineModel<number>("a");
    const selectedYears = defineModel<{label:string, value: string} | undefined>("years");
    const selectedLanguage = defineModel<{label: string, value: string} | undefined>("language");

    const { width, height } = useWindowSize();

    watch(selectedLanguage, () => {
        if(selectedLanguage.value == undefined) return;
        active.value = '1';
    })

    
    const timeList = [
        {
            label: "Less than 1 year",
            value : '<1'
        },
        {
            label: "1 year",
            value : '1'
        },
        {
            label: "2 years",
            value : '2'
        },
        {
            label: "3 years",
            value : '3'
        },
        {
            label: "4 years",
            value : '4'
        },
        {
            label: "More than 4 years",
            value : '>5'
        },
        {
            label: "I don't know",
            value : '-1'
        }
    ];

    const languageList = [
        {
            label: "Japanese",
            value : 'jp',
            flag: JP
        },
        { 
            label: "Spanish",
            value : 'es',
            flag: ES
        },
        {
            label: "English",
            value : 'en',
            flag: US
        },
        {
            label: "French",
            value : 'fr',
            flag: FR
        },
        {
            label: "German",
            value : 'de',
            flag: DE
        },
        {
            label: "Korean",
            value : 'kr',
            flag: KR
        }, 
        {
            label: "Mandarin",
            value : 'cn',
            flag: CN
        },
        {
            label: "Russian",
            value : 'ru',
            flag: RU
        },
        {
            label: "Italian",
            value : 'it',
            flag: IT
        },
        {
            label: "Dutch",
            value : 'ne',
            flag: NE
        },
        {
            label: "Portugese",
            value : 'pr',
            flag: PR
        },
        {
            label: "Czech",
            value : 'cz',
            flag: CZ
        },
        {
            label: "Arabic",
            value : 'sa',
            flag: SA
        },
        {
            label: "Cantonese",
            value : 'hk',
            flag: HK
        },
        {
            label: "Tagalog",
            value : 'ph',
            flag: PH
        },
        {
            label: "Hebrew",
            value : 'ps',
            flag: PS
        },
        {
            label: "Norwegian",
            value : 'no',
            flag: NO
        },
        {
            label: "Indonesian",
            value : 'id',
            flag: ID
        },
        {
            label: "Thai",
            value : 'th',
            flag: TH
        },
        {
            label: "Other",
            value : 'other',
            flag: AQ
        }
    ];

    onMounted(() => {   
        selectedLanguage.value = undefined;
        selectedYears.value = undefined;
        panel.value = 0;
    })



    const router = useRouter();
    function NextPage(){
        window.ipcRenderer.invoke("answer-survey-language", selectedLanguage.value, selectedYears.value).then((res:any) => {
            router.push('/survey/apps');
        });
    }

</script>

<template>
    
    <div class=" flex w-screen">
        <div class="px-12 pb-12 flex flex-col w-full bg-black h-screen "
            :style="{
                paddingTop: height > 800 ? '3rem' : '0rem'
            }"
        >

            <div class="pb-2" :style="{
                display: height > 800 ? 'block' : 'none'
            }">
                <img :src="Logo" class=" w-12 h-12">
            </div>
            <div class="font-semibold text-white text-4xl py-4">
                Tell us more about your learning journey.
            </div>
            <p class="text-sm">
            </p>   
            <div class="flex flex-col flex-grow">
                <div class=" p-2 bg-[#18181B] rounded-lg">
                    <Accordion v-model:value="active">
                        <AccordionPanel value="0">
                            <AccordionHeader>
                                <div class="font-semibold text-white text-2xl">
                                    What language are you learning?
                                </div>
                            </AccordionHeader>
                            <AccordionContent>
                                <p class="pb-4">
                                    If there are multiple languages you are learning, please select the one you're most comfortable with. 
                                </p>   
                                <Listbox :scrollHeight="height > 800 ? '300px' : (height / 3 + 'px')" v-model="selectedLanguage" :options="languageList" >
                                        <template #option="slotProps:{option: {label: string, value: string; flag:string;}, index: number}">
                                            <div class="w-full flex flex-col">
                                                <div class="flex flex-col jusitfy-center h-full">
                                                    <div class="font-semibold text-md select-none flex items-center">
                                                        <div class="w-7 mr-2 " v-html="slotProps.option.flag"/>
                                                        {{slotProps.option.label}}

                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </Listbox>
                            </AccordionContent>
                        </AccordionPanel>
                        <AccordionPanel value="1">
                            <AccordionHeader>
                                <div class="font-semibold text-white text-2xl">
                                    How long have you been learning this language for?
                                </div>
                            </AccordionHeader>
                            <AccordionContent>
                                <p class="m-0 pb-2">
                                    A ballpark estimate of how long you've been learning this language for is fine. 
                                    If the number fits between two options, select the closest one.
                                </p>
                                <SelectButton v-model="selectedYears" :options="timeList" optionLabel="value" dataKey="value" aria-labelledby="custom">
                                    <template #option="slotProps">
                                        <div 
                                        
                                        v-tooltip.bottom="{
                                            value: slotProps.option.description,
                                            pt: {
                                                arrow: {
                                                    style: {
                                                        backgroundColor: '',
                                                    }
                                                },
                                                text: {
                                                    style: {
                                                        fontSize: '0.8rem',
                                                        textAlign: 'center',
                                                        color: 'white',
                                                    }
                                                }
                                            }
                                        }"
    
                                        
                                        >
                                            {{  
                                                slotProps.option.label
                                            }}
                                        </div>
                                    </template>
                                </SelectButton>
                                
                            </AccordionContent>
                        </AccordionPanel>
                    </Accordion>
                </div>
            </div>
            
            <Button :disabled="selectedLanguage == null || selectedYears == null" label="Continue" @click="NextPage" ></Button>
        </div>
        
    </div>
    

</template>