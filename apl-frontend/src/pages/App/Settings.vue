<script setup lang="ts">
import { useRouter } from 'vue-router';
import SideBarContainer from '../../components/Common/SideBarContainer.vue';
import { appPath } from '../routes/appRoutes';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import AccountSettings from '../../components/Settings/Tabs/AccountSettings.vue';
import { Options } from '../../../apl-backend/types/options';
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import GeneralSettings from '../../components/Settings/Tabs/GeneralSettings.vue';

const router = useRouter();

const config = ref<Options>();

onMounted(() => {
    window.ipcRenderer.invoke("GetConfig").then((data:Options) => {
        config.value = data;
    })
})

function save(){
    window.ipcRenderer.invoke("SetConfig", JSON.stringify(config.value)).then((data:Options) => {
        config.value = data;
    })
}

function setConfig(newconfig:Options){
    console.log(newconfig);
    config.value = newconfig;
}

</script>

<template>  
    <SideBarContainer :currentRoute="router.currentRoute.value.path as appPath">
        <div class="flex flex-col w-full h-full">
            <div class="flex flex-col flex-grow w-full h-full">
                <div class="flex w-full h-20 items-center px-10 mt-8  justify-between">
                  <div class="flex flex-col text-white font-bold text-3xl">
                    Settings
                  </div>
                </div>
                <div class="flex w-full px-10 flex-grow">
                    <div class="flex w-full px-2 h-full rounded-lg">
                        <Tabs value="0" class="w-full"
                        :dt="{ activeBarBackground: '#2BFAFA', tabActiveBorderColor: '#2BFAFA' }"
                        >
                            <TabList pt:activeBar="my-class" pt:tabList="my-class-2">
                                <Tab value="0">General</Tab>
                                <Tab value="1">Account</Tab>
                                <Tab value="2" disabled>Appearance</Tab>
                                <Tab value="3">Anki</Tab>
                                <Tab value="4">Time Tracking</Tab>
                                <Tab value="5">Notifications</Tab>
                                <Tab value="6">Reports</Tab>
                            </TabList>
                            <TabPanels unstyled class="py-2">
                                <TabPanel value="0" class="">
                                    <GeneralSettings :config="config" @update:config="setConfig"/>
                                </TabPanel>
                                <TabPanel value="1" class="">
                                    <AccountSettings :config="config" @update:config="setConfig" />
                                </TabPanel>
                                <TabPanel value="2">
                                    <p class="m-0">
                                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                                        ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
                                    </p>
                                </TabPanel>
                                <TabPanel value="3">
                                    <p class="m-0">
                                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa
                                        qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                                    </p>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </div>
                </div>
                <Button @click="save">Save</Button>
            </div>
        </div>
        

    </SideBarContainer>
</template>


<style>
.my-class {
  height: 4px !important;
  border-radius: 1rem;
}

.my-class-2 {
 background-color: transparent !important;
}
</style>
