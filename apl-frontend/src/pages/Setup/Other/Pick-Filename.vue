<script setup lang="ts">
    import Logo from '../../../assets/Logo.png'
    import { useRouter } from 'vue-router';
    import SetupBackground from '../../../components/Setup/SetupBackground.vue';
    import Button from 'primevue/button';
    import BackButton from '../../../components/Common/BackButton.vue';
    import InputText from 'primevue/inputtext';
    import { onMounted, ref } from 'vue';
    import Dropdown from 'primevue/dropdown';
    import AccountDisplay from '../../../components/Common/AccountDisplay.vue';
    import Panel from 'primevue/panel';
import { reportExtensions } from '../../../../apl-backend/types/options';
    
    const extensions = reportExtensions;

    const selectedExtension = defineModel<string>('selectedExtension');
    const filename = defineModel<string>('filename');
    const filePath = ref("")

    onMounted(() => {

        window.ipcRenderer.invoke("GetPath", "userData").then(path => {
            filePath.value = path;
        })
        
        filename.value = "Progress Report";
        selectedExtension.value = extensions.at(0);
    })

    function chooseFilePath(){
        window.ipcRenderer.invoke("OpenPathDialog", filePath.value).then(path => {
            if(!path || path.length == 0) return;
            filePath.value = path[0];
        })
    }

    const router = useRouter()
    function NextPage(){
        window.ipcRenderer.invoke("SetOutputFile", {
            path: filePath.value,
            name: filename.value,
            extension: selectedExtension.value
        });
        router.push('/setup/pick-survey');
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
                <BackButton route="/setup/anki-home"/>
                <div class="font-semibold text-white text-4xl">
                    Please choose a path.
                </div>
                <p class="text-sm">
                    Your progress reports will be saved under this name with a number suffix. For example, if you choose "MyReport.png", your reports will be saved as "MyReport 1.png", "MyReport 2.png", etc.
                </p>    
                <div class="flex flex-col gap-2 mt-2 h-12">
                    <div>
                        <Button class= w-full @click="chooseFilePath">
                            <div class="flex flex-col w-full " style="direction: rtl;">
                             <div class="text-sm text-ellipsis overflow-hidden whitespace-nowrap ">
                                 {{ 
                                     filePath
                                 }}
                             </div>
                             <div class="text-xs">
                                 (Click to edit)
                             </div>
                            </div> 
                         </Button>
                    </div>
                    <div class="flex gap-2">
                        <InputText v-model="filename" class="w-full text-white font-semibold  rounded-xl p-2 h-12 "/>
                        <Dropdown v-model="selectedExtension" :options="extensions" class="w-1/4 text-white font-semibold text-lg rounded-xl h-12 "/>
                    </div>
                    
                </div>

                
                <div class="flex flex-grow justify-end items-end">
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