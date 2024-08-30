<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRoute, useRouter } from 'vue-router';
    import Button from 'primevue/button';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import AccountDisplay from '../../../components/Common/AccountDisplay.vue';
    import BackButton from '../../../components/Common/BackButton.vue';
    import AnkiLogo from '../../../assets/AnkiLogo.png';

    const router = useRouter()
    function NextPage(){
        router.push('/setup/anki-connect');
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3 bg-black h-screen">
            <AccountDisplay/>
            <div class="flex flex-col flex-grow py-5 justify-start gap-2 text-left">
                <BackButton route="/setup/toggl-success"/>
                <div class="font-semibold text-white text-4xl">
                    Time to connect to Anki.
                </div>
                <p class="text-sm">
                    Support for other Spaced Repetition Software (SRS) will be added in the future.
                </p>
                <div class="flex justify-center flex-grow items-center">
                    <div class="flex flex-col gap-2 items-center w-[30rem] ">
                        <div class="flex gap-4 items-center">
                            <img :src="AnkiLogo" class=" w-12"/>
                            <i class="pi pi-link" style="font-size: 2rem"></i>
                            <img :src="Logo" class=" w-14"/>
                        </div>
                        <div class="text-red-500 text-2xl font-semibold text-center">
                            Please close all instances of Anki before continuing.
                        </div>
                    </div>
                </div>
                <div class="flex justify-end">
                    <Button 
                    @click="NextPage"
                    style="width: 120px;"
                    label="Continue"
                    />    
                </div>
                                
            </div>

        </div>
    </div>
    

</template>