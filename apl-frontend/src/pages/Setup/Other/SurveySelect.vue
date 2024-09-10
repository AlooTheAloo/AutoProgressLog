<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRouter } from 'vue-router';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import Button from 'primevue/button';
    import BackButton from '../../../components/Common/BackButton.vue';
import AccountDisplay from '../../../components/Common/AccountDisplay.vue';

    const router = useRouter()
    function StartSurvey(){
        router.push('/survey/index');
    }

    function FinishSetup(){
        router.push('/setup/complete');
    }

</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
            <div>
                <AccountDisplay/>
            </div>
            <div class="flex flex-col flex-grow py-5 justify-start gap-2 text-left">
                <BackButton route="/setup/pick-filename"/>
                <div class="font-semibold text-white text-4xl">
                    Would you like to answer a few questions to help us improve AutoProgressLog?
                </div>
                <p class="text-sm">
                    This survey is completely optional and will not collect any personal information. We use the data to get a sense of how AutoProgressLog is being used and to make improvements.
                </p>
                <div class="flex gap-2 mt-2 flex-grow">
                    
                </div>
                <div class="flex justify-end gap-3">
                    <Button 
                    severity="secondary"
                    @click="FinishSetup"
                    style="width: 120px;"
                    label="No Thanks"
                    />  
                    <Button 
                    @click="StartSurvey"
                    style="width: 120px;"
                    label="Yes"
                    />    
                </div>
            </div>
        </div>
    </div>
    

</template>