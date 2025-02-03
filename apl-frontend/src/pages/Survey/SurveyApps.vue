<script setup lang="ts">
    import Listbox from 'primevue/listbox';
    import Logo from '../../assets/Logo.png'
    import Button from 'primevue/button';
    import { useRouter } from 'vue-router';
    import { computed, onMounted, ref, watch } from 'vue';
    import { useWindowSize } from '@vueuse/core'
   
    import jpdb from '../../assets/AppLogos/JPDB-logo.png'
    import refold from '../../assets/AppLogos/Refold-logo.png'
    import clockify from '../../assets/AppLogos/Clockify-logo.png'
    import mokuro from '../../assets/AppLogos/Mokuro-logo.png'
    import ttsu from '../../assets/AppLogos/Ttsu-logo.png'



    const selectedApps = defineModel<{label: string, value: any}[] | undefined>("language");
    const { width, height } = useWindowSize();

    const appList = [
        {label: "JPDB", value: "jpdb", image: jpdb},
        {label: "The Refold App", value: "refold", image: refold},
        {label: "Clockify", value: "clockify", image: clockify},
        {label: "Mokuro", value: "mokuro", image: mokuro},
        {label: "Ttsu Reader", value: "ttsu", image: ttsu},
    ]

    onMounted(() => {   
        selectedApps.value = undefined;
    })


    const buttonLabel = computed(() => {
        if ((selectedApps.value?.length ?? 0) == 0) {
            return "I don't use any of these apps";
        }
        return "Continue";
    })

    const router = useRouter();
    function NextPage(){
        const sanitizedData = JSON.parse(JSON.stringify(selectedApps.value)).map((x:any) => x.value);
        window.ipcRenderer.invoke("answer-survey-apps", sanitizedData).then((res:any) => {
            router.push('/setup/complete');
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
            <div class="font-semibold text-white text-4xl pt-4">
                Tell us about the tools you use.
            </div>
            <p class="text-sm pb-4">
                Select any of the following tools you use to learn your target language. We use this information to determine which apps to support next.
                You can select as many as you like.
            </p>   
            <div class="flex flex-col flex-grow">
                <div class=" p-2 bg-[#18181B] rounded-lg">
                    <Listbox multiple
                    :scrollHeight="height > 800 ? '700px' : (height / 2 + 'px')" v-model="selectedApps" :options="appList" >
                        <template #option="slotProps:{option: {label: string, value: string; image:string;}, index: number}">
                            <div class="w-full flex flex-col">
                                <div class="flex flex-col jusitfy-center h-full">
                                    <div class="font-semibold text-md select-none flex items-center">
                                        <img :src="slotProps.option.image" class="w-12 h-12 mr-5"/>
                                        {{slotProps.option.label}}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Listbox>
                </div>
            </div>
            
            <Button :label="buttonLabel" @click="NextPage"/>
        </div>
        
    </div>
    

</template>