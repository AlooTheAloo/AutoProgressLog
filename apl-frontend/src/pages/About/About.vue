<script setup lang="ts">
import { useRouter } from 'vue-router';
import { appPath } from '../routes/appRoutes';
import SideBarContainer from '../../components/Common/SideBarContainer.vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

const router = useRouter();

</script>

<template>
    <div class="flex flex-col w-full h-full">
        <div class="flex flex-col flex-grow w-full h-full">
            <div class="flex w-full h-16 items-center px-10  justify-between text-center">
                <div class="flex flex-col text-white font-bold text-3xl w-full text-center">
                    About APL
                </div>
            </div>
            <div class="flex w-full px-10 flex-grow">
                <div class="flex w-full px-2 h-full rounded-lg">
                    <Tabs value="0" class="w-full" :dt="{ activeBarBackground: '#2BFAFA', tabActiveBorderColor: '#2BFAFA' }">
                        <TabList pt:activeBar="my-class" pt:tabList="my-class-2">
                            <Tab value="0">About</Tab>
                            <Tab value="1">Credits</Tab>
                            <Tab value="2">License</Tab>
                        </TabList>
                        <TabPanels unstyled class="py-2">
                            <TabPanel value="0" class="h-[8rem]">
                                <div class="flex flex-col gap-2 items-center w-full justify-between h-full flex-grow  ">


                                    <div class="flex flex-col w-full justify-start">
                                        <h1 class="text-2xl font-bold text-white">
                                            Powered by
                                        </h1>
                                        <div class="flex gap-5 flex-wrap gap-y-0">
                                            <a class="text-blue-200 underline" href="https://www.electronjs.org/" target="_blank">Electron</a>
                                            <a class="text-blue-200 underline" href="https://vuejs.org/" target="_blank">Vue.js</a>
                                            <a class="text-blue-200 underline" href="https://www.typescriptlang.org/" target="_blank">Typescript</a>
                                            <a class="text-blue-200 underline" href="https://vite.dev/" target="_blank">Vite</a>
                                            <a class="text-blue-200 underline" href="https://primevue.org/" target="_blank">Primevue</a>
                                            <a class="text-blue-200 underline" href="https://apexcharts.com/" target="_blank">Apex Charts</a>

                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-200">
                                        AutoProgressLog V1.0.0 
                                    </div>
                                </div>

                            </TabPanel>
                            <TabPanel value="1" class="">
                                <div class="flex flex-col gap-2 items-center w-full ">
                                    <div class="text-lg text-gray-200 font-bold text-left">
                                        This project would not have been possible without the help of these awesome people
                                        <div class="flex gap-5 mt-5">
                                            <div class="text-sm text-gray-200">
                                                <a class="text-blue-200 underline" href="https://github.com/Retexc" target="_blank">Retexc</a>
                                            </div>
                                            <div class="text-sm text-gray-200">
                                                <a class="text-blue-200 underline" href="https://github.com/YoussefHamdouni" target="_blank">Requiem</a>
                                            </div>
                                            <div class="text-sm text-gray-200">
                                                <a class="text-blue-200 underline" href="https://github.com/fuyuka1d3su" target="_blank">Atho</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>

                                </div>
                            </TabPanel>
                            
                            <TabPanel value="2" class="">
                                <h1 class="text-2xl font-bold text-white">
                                    License is available
                                    <a class="text-blue-200 underline" href="https://github.com/AlooTheAloo/AutoProgressLog/blob/main/LICENSE" target="_blank">
                                         here
                                    </a>
                                </h1>
                                
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </div>
            </div>
            
        </div>
    </div>
</template>