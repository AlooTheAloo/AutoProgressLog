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

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
            <div>
                <img :src="Logo" class=" w-12 h-12">
            </div>
            <div class="flex flex-col flex-grow justify-start mt-10 gap-2 text-left font-semibold text-4xl">
                <div>
                    Hi i need perms idiot
                </div>
                <div class="text-gray-600 font-light mb-5 text-lg ">
                    Lorem ipsum dolor sit amet consectur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </div>

            </div>
            <Button label="Give perms" @click="NextPage" class="bg-green-500 text-white font-semibold text-xl rounded-xl p-2 mt-10"/>

        </div>
    </div>
    

</template>