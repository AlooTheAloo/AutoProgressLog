<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import { onMounted, ref } from 'vue';
    import { TogglAccount } from '../../../../types/TogglAccount';
    import ProgressSpinner from 'primevue/progressspinner';
    import Listbox from 'primevue/listbox';
    import Button from 'primevue/button';
    import { useRouter } from 'vue-router';
    
    const togglAccounts = ref<TogglAccount[]|undefined>(undefined)
    const selectedAccount = defineModel<TogglAccount>()

    const router = useRouter();
    function ManualConnection(){
        router.push('/setup/toggl-manual-connect')
    }

    function NextPage(){
        let acc:TogglAccount;
        if(selectedAccount.value == undefined){
            acc = (togglAccounts.value ?? [])[0];
        }
        else
            acc = selectedAccount.value;

        window.ipcRenderer.invoke('toggl-api-key-set', acc.api_token).then(() => {
            router.push('/setup/toggl-success');
        })
    }




    onMounted(async () => {
        window.ipcRenderer.invoke('Toggl-Connect').then((accounts:TogglAccount[]) => {
            togglAccounts.value = accounts;
            console.log(accounts);
        })
    })
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
            <div>
                <img :src="Logo" class=" w-12 h-12">
            </div>
            <div class="flex flex-col flex-grow py-10 justify-start gap-1 text-left " v-if="togglAccounts == undefined">
                <div class="font-semibold text-3xl text-white">
                    Connecting to your Toggl Track account...
                </div>
                <div class="text-sm">
                    You may be asked to give permission during this process.
                </div>
                <div class="flex flex-grow  items-center justify-between">
                    <ProgressSpinner />
                </div>
            </div>
            <div  class="flex flex-col flex-grow py-10 justify-start gap-1 text-left " v-else>
                <div v-if="togglAccounts.length == 0" class="flex flex-col h-full">
                    <div class="font-semibold text-3xl">
                        No Toggl Track accounts found!
                    </div>
                    <div class="text-sm">
                        Let's try connecting to your Toggl Track account manually.
                    </div>

                    <div class="flex flex-grow items-end justify-end">
                        <Button style="width: 120px;" label="Continue" @click="ManualConnection()"/>
                    </div>
                </div>
                <div v-else-if="togglAccounts.length == 1" class="flex flex-col flex-grow">
                    <div class="font-semibold text-3xl text-white">
                        We found your Toggl Track account!
                    </div>
                    <div class="flex flex-grow items-center">
                        <div class="w-full h-16 bg-[#18181B] rounded-xl p-5 flex flex-col">
                            <div class="flex gap-5 items-center h-full">
                                <img :alt="togglAccounts[0].name" v-bind:src="togglAccounts[0].pfp_url" class=" h-8 w-8 rounded-md"/>
                                <div class="font-semibold text-md">
                                    {{togglAccounts[0].name}}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-end justify-between">
                        <div>
                            <Button label="This is not my account" style="font-size: 12px; padding:0px;" link @click="ManualConnection"/>
                        </div>
                        <div>
                            <Button style="width: 120px;" label="Continue" @click="NextPage"/>
                        </div>
                    </div>
                </div>
                <div v-else class="h-full flex flex-col">
                    <div class="font-semibold text-3xl text-white">
                        We found {{togglAccounts.length}} Toggl Track accounts on your device.
                    </div>
                    <div class="text-sm">
                        Please select the account you would like to use to track your immersion time.
                    </div>
                    <div class="flex flex-col flex-grow justify-center">
                        <Listbox v-model="selectedAccount" :options="togglAccounts" style="gap: 2px;" >
                            <template #option="slotProps:{option: TogglAccount, index: number}">
                                <div class="w-full h-12 flex flex-col">
                                    <div class="flex gap-5 items-center h-full">
                                        <img v-bind:src="slotProps.option.pfp_url" class=" h-8 w-8 rounded-md"/>
                                        <div class="font-semibold text-md">
                                            {{slotProps.option.name}}
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </Listbox>
                    </div>
                    <div class="flex items-end justify-between">
                        <div>
                            <Button label="My account is not listed" style="font-size: 12px; padding:0px;" link @click="ManualConnection"/>
                        </div>
                        <div>
                            <Button style="width: 120px;" label="Continue" @click="NextPage()" v-bind:disabled="selectedAccount == undefined"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    

</template>