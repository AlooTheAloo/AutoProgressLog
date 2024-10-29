<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRoute, useRouter } from 'vue-router';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import Button from 'primevue/button';
    import { onMounted } from 'vue';

    const router = useRouter();

    function NextPage(){
        router.push('/app/dashboard');
    }
    
    onMounted(() => {
        window.ipcRenderer.invoke("SaveConfig");
    })
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
            <div>
                <img :src="Logo" class=" w-12 h-12">
            </div>
            <div class=" text-white flex flex-col flex-grow  justify-center gap-2 text-left font-semibold text-4xl">
                You're done ! 
                <br>
                Enjoy using AutoProgressLog!
            </div>
            <Button label="Go to dashboard" @click="NextPage" class="w-full text-white font-semibold text-xl rounded-xl p-2 mt-10"/>

        </div>
    </div>
    

</template>