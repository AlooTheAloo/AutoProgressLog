<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRoute, useRouter } from 'vue-router';
    import Button from 'primevue/button';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import AccountDisplay from '../../../components/Common/AccountDisplay.vue';
    import BackButton from '../../../components/Common/BackButton.vue';
    import AnkiLogo from '../../../assets/AnkiLogo.png';
    import ProgressSpinner from 'primevue/progressspinner';
    import { ref } from 'vue';
    import Listbox from 'primevue/listbox';
    

    const message = ref<string>();
    const router = useRouter()
    const profiles = ref<{name: string, deckCount: number; }[]>([]);
    const selectedProfile = defineModel<{name: string, deckCount: number; }>();


    const handleWorked = (worked:boolean) => {
        if(worked == null) return;
        if(worked){
            router.push('/setup/anki-success');
        }
        else {
            router.push('/setup/anki-failure');
        }
    }

    window.ipcRenderer.on("anki-multiple-profiles-detected", (sender, p: {name: string; deckCount: number; }[]) => {
        profiles.value = p;
    });

    window.ipcRenderer.on("anki-connect-message", (sender, m: any) => {
        message.value = m;
    });

    window.ipcRenderer.invoke("anki-connect-start").then(handleWorked);


    function SelectProfile(){
        window.ipcRenderer.invoke("anki-profile-select", selectedProfile.value?.name).then(handleWorked);
        profiles.value = [];
        selectedProfile.value = undefined;
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3 bg-black h-screen">
            <AccountDisplay/>
            <div class="flex flex-col flex-grow py-5 gap-2 text-left font-semibold text-4xl" v-if="profiles.length == 0">
                <div class="h-8">
                </div>
                <div class="font-semibold text-white">
                    Connecting to Anki...
                </div>
                <p class="text-sm">
                    An anki window may launch and shut down during this process.                
                </p>
                <div class="flex justify-center flex-grow items-center">
                    <div class="flex flex-col gap-2 items-center w-[30rem] ">
                        <div class="flex gap-4 items-center">
                            <img :src="AnkiLogo" class=" w-12"/>
                            <ProgressSpinner style="width: 50px; height: 50px"/>
                            <img :src="Logo" class=" w-14"/>
                        </div>
                        <div class="text-2xl text-center text-white">
                            {{ message }}...
                        </div>
                    </div>
                </div>
                <div class=" h-12 "/>
                
            </div>
            <div v-else class="flex flex-col flex-grow py-5 gap-2  text-left font-semibold text-4xl">
               
                <div class="h-8">
                </div>
                <div class="font-semibold text-white">
                    We found multiple Anki profiles.
                </div>
                <p class="text-sm">
                    Please select the profile you would like to connect to.
                </p>
                <div class="flex flex-grow items-center w-full ">
                    <Listbox
                    scroll-height="none"
                    v-model="selectedProfile" :options="profiles" style="gap: 2px;" class=" w-full">
                        <template #option="slotProps:{option: {name: string, deckCount: number; }, index: number}">
                            <div class="w-full flex flex-col">
                                <div class="flex flex-col jusitfy-center h-full">
                                    <div class="font-semibold text-xl">
                                        {{slotProps.option.name}}
                                    </div>
                                    <div class="text-sm">
                                        {{ 
                                            slotProps.option.deckCount 
                                        }} decks
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Listbox>
                </div>
                
                <Button label="Select Profile" @click="SelectProfile" class=" h-12" :disabled="selectedProfile == null"  />
            </div>
        </div>
    </div>
    

</template>