<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRouter } from 'vue-router';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import Button from 'primevue/button';
    import BackButton from '../../../components/Common/BackButton.vue';

    const router = useRouter()
    function ManualConnection(){
        router.push('/setup/toggl-manual-connect')
    }

    function AutomaticConnection(){
        router.push('/setup/toggl-connect')
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
            <div>
                <img :src="Logo" class=" w-12 h-12">
            </div>
            <div class="flex flex-col flex-grow py-5 justify-start gap-1 text-left ">
                <BackButton route="/setup/client-server-selection"/>
                <div class="font-semibold text-3xl text-white">
                    Time to find and connect your Toggl Track account!
                </div>
                <div class="text-sm">
                    This automatic connection only works if you use Google Chrome and are comfortable with sharing your browser cookies with us. If you use a different browser or you'd rather not, please select the option to manually configure toggl.
                </div>
                <div class="flex flex-grow  items-end justify-between">
                    <div>
                        <Button label="I'd rather do it manually" style="font-size: 12px; padding:0px;" link @click="ManualConnection"/>
                    </div>
                    <div>
                        <Button style="width: 120px;" label="Continue" @click="AutomaticConnection"/>
                    </div>

                </div>
            </div>
        </div>
    </div>
    

</template>