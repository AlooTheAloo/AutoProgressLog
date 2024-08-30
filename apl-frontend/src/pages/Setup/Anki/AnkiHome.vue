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
            <div class="flex flex-col flex-grow py-5 gap-2 text-left font-semibold text-4xl">
                <BackButton route="/setup/toggl-home"/>
                <div class="font-semibold text-white">
                    Time to connect to Anki.
                </div>
                <p class="text-sm">
                    Lorem ipsum dolor sit amet consectetur. Elementum malesuada posuere lacus in euismod vulputate volutpat. 
                </p>
                <div class="flex justify-center flex-grow items-center">
                    <div class="flex flex-col gap-2 items-center w-[30rem] ">
                        <div class="flex gap-4 items-center">
                            <img :src="AnkiLogo" class=" w-12"/>
                            <i class="pi pi-link" style="font-size: 2rem"></i>
                            <img :src="Logo" class=" w-14"/>
                        </div>
                        <div class="text-red-500 text-2xl text-center">
                            Please close all instances of Anki before continuing.
                        </div>
                    </div>
                </div>
                
            </div>
            <Button label="Let's go!" @click="NextPage" class="h-12 w-full text-white font-semibold text-xl rounded-xl p-2 mt-10"/>

        </div>
    </div>
    

</template>