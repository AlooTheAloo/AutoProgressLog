<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRouter } from 'vue-router';
    import Button from 'primevue/button';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import AccountDisplay from '../../../components/Common/AccountDisplay.vue';
    import BackButton from '../../../components/Common/BackButton.vue';
    import AnkiLogo from '../../../assets/AnkiLogo.png';
    import { ref } from 'vue';
    const router = useRouter()

    function NextPage(){
        router.push('/setup/anki-manual-connect')
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3 bg-black h-screen">
            <AccountDisplay/>
            <div class="flex flex-col flex-grow pt-5  gap-2 text-left font-semibold text-4xl">
                <BackButton route="/setup/anki-home"/>
                <div class="font-semibold text-white">
                    The connection failed.
                </div>
                <p class="text-sm">
                    You may have an older version of anki or some incompatible software installed on your machine.
                    <br>
                    Let's try connecting manually.                
                </p>
                <div class="flex justify-center flex-grow items-center">
                    <div class="flex flex-col gap-2 items-center w-[30rem] ">
                        <div class="flex gap-4 items-center">
                            <img :src="AnkiLogo" class=" w-12"/>
                            <i class="pi pi-times-circle text-red-300" style="font-size: 2rem"/>
                            <img :src="Logo" class=" w-14"/>
                        </div>
                        <div class="font-semibold text-2xl text-center text-white">
                            Failed to connect to Anki
                        </div>
                    </div>
                </div>
                <Button label="Continue" @click="NextPage" class=" h-12 absolute w-full text-white text-xl rounded-xl "/>

            </div>
        </div>
    </div>
    

</template>