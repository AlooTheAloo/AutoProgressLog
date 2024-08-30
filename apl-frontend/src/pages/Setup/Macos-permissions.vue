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
    <div class="pl-[94px] p-12 flex flex-col w-[950px] bg-black h-screen">
        <div class="mb-[36px]">
            <img :src="Logo" class="w-[96px] h-[96px] p-1 bg-white rounded-xl justify-center items-center gap-1 inline-flex">
        </div>
        <div class="flex flex-col flex-grow justify-start mt-10 gap-y-[18px] text-left font-semibold text-5xl">
            <div class="text-white">
                It seems that your device is <br> running MacOS.
            </div>
            <div class="w-[740px] opacity-80 text-white text-2xl font-semibold">
                To proceed with the setup, we need the screen and audio <br> recording permission for some operations during the setup.
            </div>
        </div>
        <div class="w-full flex justify-end">
            <Button label="Continue" rounded @click="NextPage" style="font-weight: bold;" class="w-[322.35px] h-[60.82px] bg-white flex items-center justify-center mr-[35px] font-bold text-[32.44px]"/>
        </div>
        </div>
    </div>

    

</template>