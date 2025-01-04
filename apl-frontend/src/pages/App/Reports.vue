
<script setup lang="ts">
import Button from "primevue/button";
import DataView from "primevue/dataview";
import { ref, onMounted } from "vue";
import { appPath } from "../routes/appRoutes";
import { useRouter } from "vue-router";
import SideBarContainer from "../../components/Common/SideBarContainer.vue";
import dayjs, { Dayjs } from "dayjs";
import ProgressSpinner from "primevue/progressspinner";
import { PageState } from "primevue/paginator";
import Skeleton from "primevue/skeleton";

const rows = 6;
const router = useRouter();

type ListReport = {
    id: string;
    score: number;
    date: Dayjs;
    fileExists: boolean;
    revertable?: boolean;
}


async function getReports(){
    return new Promise<void>((res, rej) => {
        window.ipcRenderer.invoke("Get-Reports").then((data:any) => {
            reports.value = data.map((x:any) => {
                return {
                    ...x,
                    date: dayjs(x.date)
                }
            });
            res();
        })
    })
}


async function getImages(from:number, count:number){
    return new Promise<void>((res, rej) => {
        window.ipcRenderer.invoke("Get-Images", from, from + count).then((data:any) => {
            images.value = data;
            res();
        });
    })
}

onMounted(() => {
    getReports();
    getImages(0, rows);
});

const reverting = ref<boolean>(false);

function revertReport(){
    images.value = undefined;
    reverting.value = true;
    window.ipcRenderer.invoke("Reverse-Report").then(async x => {
        await getReports();
        await getImages(0, rows);
        reverting.value = false;
    });
}

const reports = ref<ListReport[]|undefined>(undefined);
const images = ref<string[]|undefined>(undefined);
const first = ref<number>(0);

const pageChanged = (event: PageState) => {
    images.value = undefined;
    getImages(event.first, event.rows);
    first.value = event.first;
}

function openReport(id:string){
    window.ipcRenderer.invoke("Open-Report", id);
}


</script>

<template>
    <SideBarContainer :currentRoute="router.currentRoute.value.path as appPath" >
        <div v-if="!reports" class="flex flex-col w-full h-full items-center justify-center">
            <ProgressSpinner />
        </div>
        <div v-else-if="reports.length == 0" class="flex flex-col w-full h-full items-center justify-center">
            <div class="flex flex-col flex-grow w-full h-full">
                <div class="flex w-full h-full items-center px-10 my-5 justify-center flex-col">
                    <div class="flex flex-col">
                        <h1 class="bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent from-[#89BDFF] to-[#40ffff]">
                            No reports have been generated yet
                        </h1>
                        <h2 class="text-xl text-center w-full my-2">
                            Create a report and come back to see your progress!
                        </h2>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="flex flex-col w-full h-full">
            <div class="flex flex-col flex-grow w-full h-full">
                <div class="flex w-full h-20 items-center px-10 my-5 justify-between">
                  <div class="flex flex-col">
                    <h1 class="bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent from-[#89BDFF] to-[#40ffff]">
                        Generated Reports
                    </h1>
                  </div>
                </div>
                <div class="flex w-full px-10 flex-grow">
                    <div class="flex w-full px-2 py-2 bg-[#18181b] h-fit rounded-lg">
                        <DataView dataKey="" :value="reports" class="w-full rounded-lg" :paginator="reports.length > rows" :rows="rows" v-on:page="pageChanged" :first="first">
                            <template #list="slotProps">
                                <div class="flex flex-col">
                                    <div v-for="(item, index) in slotProps.items as ListReport[]" :key="index">
                                        <div class="flex flex-col sm:flex-row sm:items-center p-6 gap-4" :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }">
                                            <div class="w-14">
                                                <div v-if="images == undefined" class="w-14 h-14 ">
                                                    <Skeleton height="3.5rem" ></Skeleton>
                                                </div>
                                                <div v-else class="h-14 flex items-center justify-center">
                                                    <img v-if="(images ?? [])[index] != ''" class="block xl:block mx-auto rounded-sm h-14" :src="'data:image/png;base64,' + (images ?? [])[index]" :alt="item.id" />
                                                    <div v-else class="text-xs text-center">
                                                        No image available
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="flex flex-col md:flex-row justify-between md:items-center flex-1 gap-6">
                                                <div class="flex flex-row md:flex-col justify-between items-start gap-2">
                                                    <div>
                                                        <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">
                                                            {{
                                                                item.date.format('Do')
                                                            }}
                                                            of
                                                            {{
                                                                item.date.format('MMMM').toLowerCase()
                                                            }} 
                                                            {{
                                                                item.date.format('YYYY')
                                                            }}
                                                        </span>
                                                        <div class="text-lg font-medium">Report #{{ item.id }}</div>
                                                    </div>
                                                </div>
                                                <div class="flex flex-col md:items-end gap-8">
                                                    <div class="flex flex-row-reverse md:flex-row gap-2">
                                                        <Button v-if="item.revertable" severity="danger" :disabled="reverting" @click="revertReport()">
                                                            
                                                            
                                                            <i v-if="reverting"  :class="['pi', 'pi-spinner pi-spin text-white']" />
                                                            <i v-else class="pi pi-undo text-white" />
                                                            <span class="text-white font-semibold">
                                                                Revert report
                                                            </span>
                                                        </Button>
                                                        <Button 
                                                            v-on:click="openReport(item.id)"
                                                            icon="pi pi-folder-open" label="Open" :disabled="!item.fileExists" v-tooltip.top="{
                                                            value: item.fileExists ? '' : 'Report file could not be found',
                                                            pt: {
                                                                arrow: {
                                                                    style: {
                                                                        backgroundColor: '',
                                                                    }
                                                                },
                                                                text: {
                                                                    style: {
                                                                        fontSize: '0.6rem',
                                                                        textAlign: 'center',
                                                                        color: 'white',
                                                                    }
                                                                }
                                                            }
                                                        }"
                                                        class="flex-auto md:flex-initial whitespace-nowrap"></Button>
                                                    </div>
                                                </div>  
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </DataView>
                    </div>
                    
                </div>
            </div>
        </div>
    </SideBarContainer>
   
</template>
