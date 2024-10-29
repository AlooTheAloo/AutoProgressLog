<script setup lang="ts">
    import { useRouter } from 'vue-router';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import AccountDisplay from '../../../components/Common/AccountDisplay.vue';
    import { computed, ref } from 'vue';
    import BackButton from '../../../components/Common/BackButton.vue';
    import Button from 'primevue/button';
    import AnkiLogo from '../../../assets/AnkiLogo.png';
    import Logo from '../../../assets/Logo.png'
    import ProgressSpinner from 'primevue/progressspinner';

    const message = ref<string>();
    const router = useRouter()

    function SelectAppPath(){
        window.ipcRenderer.invoke("SelectAppPath").then((res?:string) => {
            if(res == undefined) return;
            appPath.value = res;
        })
    }

    function SelectDBPath(){
        window.ipcRenderer.invoke("SelectDBPath").then((res?:string) => {
            if(res == undefined) return;
            dbPath.value = res;
        })
    }


    function OpenAnkiDocs(){
        window.ipcRenderer.invoke("OpenExternal", "https://docs.ankiweb.net/files.html")
    }

    
    const connecting = ref<boolean>(false);

    const appPath = ref<string|undefined>(undefined);

    const appPathMessage = computed(() => {
        return appPath.value ?? "Select the Anki app path";
    })

    const dbPath = ref<string|undefined>(undefined);

    const dbPathMessage = computed(() => {
        return dbPath.value ?? "Select the Anki DataBase path";
    })

    function StartConnection(){
        connecting.value = true;
        window.ipcRenderer.invoke("anki-manual-connect-start", appPath.value, dbPath.value).then((worked) => {
            if(worked){
                router.push('/setup/anki-success');
            }
            else {
                router.push('/setup/anki-failure');
            }
        })
    }


    window.ipcRenderer.on("anki-connect-message", (sender, m: any) => {
        message.value = m;
    });
    
</script>

<template>

    <SetupBackground></SetupBackground>

    <div class=" flex w-screen">
        <div class=" p-12 flex flex-col w-2/3 bg-black h-screen">
            <AccountDisplay/>
            <div class="flex flex-col flex-grow  gap-2 text-left font-semibold text-4xl" v-if="!connecting">
                <BackButton route="/setup/anki-home"/>
                <div class="font-semibold text-white ">
                    Let's manually connect to Anki.
                </div>
                <div class="text-sm">
                    Please refer to the README or the 
                    <Button style=" padding:0%; color:aqua; font-size: 0.875rem;" label="official anki documentation" @click="OpenAnkiDocs" class="p-0"/>
                    for instructions on how to find the Database path and App path.
                </div>
                <div class="text-lg flex-grow flex justify-center flex-col gap-5">
                    <div class="flex flex-col w-full">
                        <div>
                            App Path
                        </div>
                        <div class="w-full">
                            <Button fluid v-bind:label="appPathMessage" class="w-full" @click="SelectAppPath" />
                        </div>
                    </div>
                    <div class="flex flex-col w-full">
                        <div>
                            DB Path
                        </div>
                        <div class="w-full">
                            <Button fluid v-bind:label="dbPathMessage" class="w-full" @click="SelectDBPath"/>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end">
                    <Button label="Continue" @click="StartConnection" class="w-fit h-12 absolute font-semibold text-xl rounded-xl" v-bind:disabled="!dbPath || !appPath" />
                </div>
            </div>
            <div class="flex flex-col flex-grow  gap-2 text-left font-semibold text-4xl" v-else>
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