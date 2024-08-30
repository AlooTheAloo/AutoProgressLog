<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRouter } from 'vue-router';
    import Button from 'primevue/button';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import AccountDisplay from '../../../components/Common/AccountDisplay.vue';
    import BackButton from '../../../components/Common/BackButton.vue';
    import AnkiLogo from '../../../assets/AnkiLogo.png';
    import { ref } from 'vue';
    const message = ref<string>();
    const router = useRouter()

    function NextPage(){
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3 bg-black h-screen">
            <AccountDisplay/>
            <div class="flex flex-col flex-grow  gap-2 text-left font-semibold text-4xl">
                <BackButton route="/setup/anki-connect"/>
                <div class="font-semibold text-white">
                    Connected!
                </div>
                <p class="text-sm">
                    A connection was established between APL and Anki!
                </p>
                <div class="flex justify-center flex-grow items-center">
                    <div class="flex flex-col gap-2 items-center w-[30rem] ">
                        <div class="flex gap-4 items-center">
                            <img :src="AnkiLogo" class=" w-12"/>
                            <i class="pi pi-check-circle text-green-300" style="font-size: 2rem" />
                            <img :src="Logo" class=" w-14"/>
                        </div>
                        <div class="text text-2xl text-center text-white">
                            Anki linked Successfully!
                        </div>
                        
                    </div>
                </div>
                <Button label="Continue!" @click="NextPage" class=" absolute w-full bg-green-500 text-white font-semibold text-xl rounded-xl "/>
            </div>
        </div>
    </div>
    

</template>