<script setup lang="ts">
    import Logo from '../../assets/Logo.png'
    import { useRoute, useRouter } from 'vue-router';
    import SetupBackground from '../../components/Setup/SetupBackground.vue';
    import Button from 'primevue/button';

    const router = useRouter()
    function NextPage(){
        window.ipcRenderer.invoke("request-permissions").then((res:any) => {});
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class="flex w-screen">
    <div class="pl-24 p-12 flex flex-col w-2/3 bg-black h-screen">
        <div class="mb-[36px]">
            <img :src="Logo" class="w-[96px] h-[96px]">
        </div>
        <div class="flex flex-col flex-grow justify-start mt-10 gap-y-[18px] text-left font-semibold text-5xl">
            <div class="text-white">
                It seems that your device is running MacOS.
            </div>
            <div class="text-2xl font-semibold">
                To proceed with the setup, we need the screen and audio recording permission for some operations during the setup.
            </div>
        </div>
        <div class="w-full flex justify-end pr-9">
            <Button label="Continue" rounded @click="NextPage" class="w-[322.35px] h-[60.82px] bg-white flex items-center justify-center font-bold text-[32.44px]"/>
        </div>
        </div>
    </div>

    

</template>