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
    const message = ref<string>();
    const router = useRouter()

    window.ipcRenderer.on("anki-connect-message", (sender, m: any) => {
        message.value = m;
    });

    window.ipcRenderer.invoke("anki-connect-start", ).then((worked) => {
        if(worked){
            router.push('/setup/anki-success');
        }
        else {
            router.push('/setup/anki-failure');
        }
    })




    function NextPage(){
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3 bg-black h-screen">
            <AccountDisplay/>
            <div class="flex flex-col flex-grow  gap-2 text-left font-semibold text-4xl">
                <div class="font-semibold text-white mt-16">
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
                        <div class="text text-2xl text-center text-white">
                            {{ message }}...
                        </div>
                    </div>
                </div>
                <div class=" h-12 "/>
                
            </div>
        </div>
    </div>
    

</template>