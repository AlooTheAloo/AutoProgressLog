<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import SideBarContainer from "../../components/Common/SideBarContainer.vue";
import { appPath } from "../routes/appRoutes";
import ProgressSpinner from "primevue/progressspinner";
import dayjs from "dayjs";
import { DashboardDTO } from "../../../types/DTO";
import DashboardBody from "../../components/Dashboard/DashboardBody.vue";

const timeUpdateInterval = 30000;
const router = useRouter();


function GenerateReport(){
    syncing.value = true;
    window.ipcRenderer.invoke("GenerateReport").then((data) => {
        syncing.value = false;
        dto.value = data;
    })
}
function Sync(){
    syncing.value = true;
    window.ipcRenderer.invoke("Sync").then((data) => {
        syncing.value = false;
        dto.value = data;
    })
}

const syncing = ref<boolean>(false);
const dto = ref<DashboardDTO>();
const diff = ref<string>();
let interval:Timer; 

onMounted(() => {
    window.ipcRenderer.invoke("Get-Dashboard-DTO").then((data) => {
        dto.value = data;
        setIntervalAndExecute(onDTO, timeUpdateInterval)
    }
)})

const onDTO = () => {
    diff.value = dayjs.duration(-dayjs().diff(dto?.value?.lastSyncTime)).humanize(true);
}

watch(dto, () => {
    if(dto.value != null){
        onDTO()
        console.log(diff)
    }
})

onUnmounted(() => {
    clearInterval(interval);
})

function setIntervalAndExecute(fn:()=>void, t:number) {
    fn();
    return(setInterval(fn, t));
}

</script>

<template>
    <SideBarContainer :currentRoute="router.currentRoute.value.path as appPath">
        <div v-if="dto == null" class="flex flex-col w-full h-full items-center justify-center">
            <ProgressSpinner></ProgressSpinner>
        </div>
        <div v-else class="flex flex-col w-full h-full">
            <div class="flex flex-col flex-grow w-full h-full">
                <div class="flex w-full h-32 items-center px-10 ">
                    <div class="flex-grow flex flex-col">
                        <div class="  bg-gradient-to-r bg-clip-text text-xl xl:text-4xl font-extrabold  text-transparent from-[#89BDFF] to-[#40376B]">
                            Hi, {{ dto?.userName }}!
                        </div>
                        <div class="flex items-center">
                            <div class="text-xl">
                                Last synced {{ diff }}
                            </div>
                            <div class="h-full flex mt-0.5">
                                <Button class="h-6" plain text @click="Sync" :loading="syncing">
                                    <p class="font-semibold text-[#00E0FF]">
                                        Sync Now
                                    </p>
                                    <div v-if="syncing" class="pi pi-spinner pi-spin text-[#00E0FF]"/>
                                    <div v-else class="pi pi-sync text-[#00E0FF]"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div class="h-full flex justify-end items-center">
                        <Button severity="info" @click="GenerateReport" :disabled=syncing>
                            <div class="pi pi-plus-circle text-white"></div>
                            <p class="text-white font-bold">
                                Generate Report
                            </p>
                        </Button>
                    </div>
                    
                </div>
                <div class="flex w-full items-center px-10 ">
                    <DashboardBody :dto="dto"/>
                </div>
                
            </div>
        </div>
    </SideBarContainer>
   
</template>