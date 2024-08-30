<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRouter } from 'vue-router';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import Button from 'primevue/button';
    import BackButton from '../../../components/Common/BackButton.vue';
    import { onMounted, ref } from 'vue';
    import ProgressSpinner from 'primevue/progressspinner';
    import { TogglAccount } from '../../../../types/TogglAccount';

    const togglAccount = ref<TogglAccount|undefined>(undefined)
    const router = useRouter()

    onMounted(async () => {
        togglAccount.value = await window.ipcRenderer.invoke('toggl-account-get');
        if(togglAccount.value === undefined){
            router.push('/setup/toggl-failure');
        }
    })

    function NextPage(){
        router.push('/setup/anki-home');
    }
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
        <div>
            <img :src="Logo" class=" w-12 h-12">
        </div>
        <ProgressSpinner v-if="togglAccount === undefined" class="flex-grow w-full h-full"></ProgressSpinner>
        <div v-else class="flex flex-col flex-grow pt-5 justify-start gap-2 text-left ">
            <BackButton route="/setup/toggl-home"/>
            <div class="font-semibold text-3xl text-white">
                The account was successfully linked !
            </div>
            

            <div class="flex flex-grow items-center">
                <div class="w-full h-16 bg-[#18181B] rounded-xl p-5 flex flex-col">
                    <div class="flex gap-5 items-center justify-between h-full">
                        <div class="flex gap-5 min-w-0 ">
                            <img :alt="togglAccount?.name" v-bind:src="togglAccount?.pfp_url" class="h-8 w-8 rounded-md min-w-8"/>
                            <div class="font-semibold flex items-center text-md truncate min-w-0">
                                {{
                                    togglAccount?.name
                                }}
                            </div>    
                            
                        </div>
                        
                        <i class="pi pi-check-circle" style="color: #00FF00;"></i>
                    </div>
                </div>
            </div>
            

            <div class="flex items-end justify-end">
                <div>
                    <Button 
                    @click="NextPage"
                    style="width: 120px;"
                    label="Continue"
                    />
                </div>
            </div>
        </div>
    </div>
    

</template>