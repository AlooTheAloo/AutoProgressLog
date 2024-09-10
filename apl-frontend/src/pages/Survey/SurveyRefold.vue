<script setup lang="ts">
    import Listbox from 'primevue/listbox';
    import Logo from '../../assets/Logo.png'
    import Button from 'primevue/button';
    import { useRouter } from 'vue-router';
    import RadioButton from 'primevue/radiobutton';
    import { onMounted } from 'vue';
    import SelectButton from 'primevue/selectbutton';
import { text } from 'stream/consumers';

    const hasSeenRefold = defineModel<boolean|undefined>("refold");
    const selectedStage = defineModel<string | undefined>("stage");

    const options = [
        { 
            label: "I don't know",
            description: "I don't know what stage I am at",
            value : '-1'
        },
        { 
            label: "1",
            description: "You have started immersing and learning your first 1000 words",
            value : '1'
        },
        {
            label: "2A",
            description: "You have learned the top 1000 most common words, at a minimum. You also have a solid immersion routine.",
            value : '2A'
        },
        {
            label: "2B",
            description: "You have Level 3 comprehension in your strongest domain. This means you can recognize at least half of the words in your immersion content.",
            value : '2B' 
        },
        {
            label: "2C",
            description: "You have reached Level 4 comprehension in your strongest domain. You are also starting to decrease your reliance on subtitles.",
            value : '2C' 
        },
        {
            label: "3A",
            description: "You have reached Level 5 comprehension in your strongest domain. In this stage you will be preparing yourself for output.",
            value : '3A' 
        },
        {
            label: "3B",
            description: "You are ready for Stage 3B when output is no longer a source of anxiety for you. You will start refining your output through corrections.",
            value: '3B'
        },
        {
            label: "3C",
            description: "At this stage, you are continuing to refine your output ability through corrections and feedback. You are also approaching Level 6 comprehension in your strongest domain.",
            value: '3C'
        },
        {
            label: "4",
            description: "You are ready for Stage 4 when you can have comfortable and confident conversations with native speakers about every day topics. You are able to carry on conversations for at least an hour without stumbling over your words.",
            value: '4'
        },

    ];

    onMounted(() => {   
        selectedStage.value = undefined;
        hasSeenRefold.value = undefined;
    })


    const router = useRouter();
    function NextPage(){

        window.ipcRenderer.invoke("answer-survey-track").then((res:any) => {
            router.push('/survey/');
        })
    }

</script>

<template>
    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-full bg-black h-screen ">
            <div class="pb-2">
                <img :src="Logo" class=" w-12 h-12">
            </div>
            <div class="font-semibold text-white text-4xl">
                Have you heard of the Refold language learning methodology?
            </div>
            <p class="text-sm">
            </p>   
            <div class="flex flex-col flex-grow">
                <div class="py-10">
                    <div class="flex flex-col flex-wrap gap-4 text-xl">
                        <div class="flex items-center">
                            <RadioButton v-model="hasSeenRefold" inputId="Yes" name="hasSeenRefold" :value="true" />
                            <label for="ingredient1" class="ml-2">Yes 🤘 </label>
                        </div>
                        <div class="flex items-center">
                            <RadioButton v-model="hasSeenRefold" inputId="No" name="hasSeenRefold" :value="false" />
                            <label for="ingredient4" class="ml-2"> Never heard of it 🤔</label>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="flex flex-col flex-wrap gap-4 text-xl " v-if="hasSeenRefold">
                        <div class="flex flex-col flex-grow py-4">
                            <div class="font-semibold text-white text-2xl">
                                What stage of Refold do you estimate to be at?
                            </div>
                            <p class="text-sm pb-2">
                                You can hover over the stages to see what they mean.
                            </p>   
                            <SelectButton v-model="selectedStage" :options="options" optionLabel="value" dataKey="value" aria-labelledby="custom">
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
                        </div>
                    </div>
                </div>
                                
            </div>
            
            <Button :disabled="selectedStage == null && (hasSeenRefold == true || hasSeenRefold == undefined)" label="Continue" @onclick="NextPage" ></Button>
        </div>
        
    </div>
    

</template>