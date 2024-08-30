<script setup lang="ts">
    import Logo from '../../assets/Logo.png'
    import { useRoute, useRouter } from 'vue-router';
    import SetupBackground from '../../components/Setup/SetupBackground.vue';
    import Button from 'primevue/button';

    const router = useRouter()
    function NextPage(){
        window.ipcRenderer.invoke("find-next-page-permissions").then((res:any) => {
            router.push(res)
        })
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
            <div>
                <img :src="Logo" class=" w-12 h-12">
            </div>
            <div class="flex flex-col flex-grow  justify-center gap-2 text-left font-semibold text-4xl">
                Get Started with AutoProgressLog

            </div>
            <Button label="Let's go!" @click="NextPage" class="w-full text-white font-semibold text-xl rounded-xl p-2 mt-10"/>

        </div>
    </div>
    

</template>