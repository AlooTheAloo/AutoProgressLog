<script setup lang="ts">
import { useRouter } from "vue-router";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import { Options } from "../../../apl-backend/types/options";
import { onMounted, ref, watch, reactive } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { WarningProps } from "../../../types/Warning";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import GeneralSettings from "../../components/Settings/Tabs/GeneralSettings.vue";
import AccountSettings from "../../components/Settings/Tabs/AccountSettings.vue";
import AnkiSettings from "../../components/Settings/Tabs/AnkiSettings.vue";
import TimeSettings from "../../components/Settings/Tabs/TimeSettings.vue";
import ReportsSettings from "../../components/Settings/Tabs/ReportsSettings.vue";
import { useElementBounding, useWindowSize } from "@vueuse/core";
import AppearanceSettings from "../../components/Settings/Tabs/AppearanceSettings.vue";

const router = useRouter();

const originalConfig = ref<Options>();
const config = ref<Options>();

const warningData = ref<WarningProps | undefined>(undefined);

const toast = useToast();

const settingsParent = ref();
const rect = reactive(useElementBounding(settingsParent));
const screen = useWindowSize();

onMounted(() => {
  window.ipcRenderer.invoke("GetConfig").then((data: Options) => {
    config.value = data;
    originalConfig.value = data;
  });
});

function save() {
  window.ipcRenderer
    .invoke("SetConfig", JSON.stringify(config.value))
    .then((data: Options) => {
      config.value = data;
      originalConfig.value = data;
      toast.add({
        severity: "success",
        summary: "Changes saved!",
        detail: "The changes were saved successfully.",
        life: 5000,
      });
    });
}
function reset() {
  config.value = originalConfig.value;
}

function setConfig(newconfig: Options) {
  config.value = newconfig;
}

function createWarning(warningProps: WarningProps | undefined) {
  warningData.value = warningProps;
}

function ankiTest(worked: boolean) {
  console.log("ankitest worked " + worked);
  if (worked) {
    toast.add({
      severity: "success",
      summary: "Connection worked!",
      detail: "APL and Anki can communicate properly.",
      life: 5000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Connection did not succeed",
      detail:
        "Check your connection settings again. If the issue persists, please open an issue on the github repository.",
      life: 5000,
    });
  }
}
</script>

<template>
  <Toast class="z-10" />
  <Dialog
    :header="warningData?.title"
    :visible="warningData != undefined"
    :modal="true"
    :closable="false"
  >
    <div class="flex flex-col w-full">
      <div class="mb-10" v-html="warningData?.content"></div>
      <div class="flex flex-col gap-2">
        <Button severity="danger" @click="warningData?.onYes">
          <div class="text-white">
            {{ warningData?.yesText }}
          </div>
        </Button>
        <Button
          severity="secondary"
          @click="warningData?.onNo"
          :label="warningData?.noText"
        />
      </div>
    </div>
  </Dialog>

  <div class="flex flex-col w-full">
    <div class="flex flex-col flex-grow w-full h-full">
      <div class="flex w-full h-20 items-center px-10 mt-5 justify-between">
        <h1
          class="bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent from-[#89BDFF] to-[#40ffff]"
        >
          Settings
        </h1>
      </div>
      <div class="flex w-full px-10 flex-grow">
        <div class="flex w-full px-2 h-full rounded-lg">
          <Tabs
            value="0"
            class="w-full"
            :dt="{
              activeBarBackground: '#2BFAFA',
              tabActiveBorderColor: '#2BFAFA',
            }"
          >
          <div class="relative w-full">
          <div class="absolute bottom-0 left-0 w-full border-b border-gray-700 z-0"></div>
          <div class="w-0 relative z-10">
            <TabList
              pt:activeBar="my-class"
              pt:tabList="my-class-2"
              class="w-0"
            >
              <Tab value="0">General</Tab>
              <Tab value="1">Account</Tab>
              <Tab value="2">Appearance</Tab>
              <Tab value="3">Anki</Tab>
              <Tab value="4">Time Tracking</Tab>
              <Tab value="5" disabled>Notifications</Tab>
              <Tab value="6">Reports</Tab>
            </TabList>
          </div>
        </div>



            <div
              class="overflow-y-auto"
              ref="settingsParent"
              :style="{
                height: screen.height.value - rect.y - 50 + 'px',
              }"
            >
              <TabPanels unstyled class="py-2">
                <TabPanel value="0" class="">
                  <GeneralSettings
                    :config="config"
                    @update:config="setConfig"
                  />
                </TabPanel>
                <TabPanel value="1" class="">
                  <AccountSettings
                    :config="config"
                    @update:config="setConfig"
                  />
                </TabPanel>
                <TabPanel value="2">
                  <AppearanceSettings
                    :config="config"
                    @update:config="setConfig"
                  />
                </TabPanel>
                <TabPanel value="3">
                  <AnkiSettings
                    :config="config"
                    @update:config="setConfig"
                    @danger="createWarning"
                    v-on:ankitest:worked="ankiTest"
                  />
                </TabPanel>
                <TabPanel value="4">
                  <TimeSettings :config="config" @update:config="setConfig" />
                </TabPanel>
                <TabPanel value="6">
                  <ReportsSettings
                    :config="config"
                    @update:config="setConfig"
                  />
                </TabPanel>
              </TabPanels>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  </div>

  <div
    class="mx-2 flex justify-end transition-all duration-300 ease-in-out gap-5"
    :style="{
      marginTop:
        JSON.stringify(originalConfig) == JSON.stringify(config) ? '4rem' : '',
    }"
  >
    <div class="flex gap-4">
      <Button
        :aria-hidden="JSON.stringify(originalConfig) == JSON.stringify(config)"
        :tabindex="
          JSON.stringify(originalConfig) != JSON.stringify(config) ? '0' : '-1'
        "
        @click="save"
        class="w-48"
        >Save</Button
      >
      <Button
        @click="reset"
        class="w-72"
        severity="secondary"
        :aria-hidden="JSON.stringify(originalConfig) == JSON.stringify(config)"
        :tabindex="
          JSON.stringify(originalConfig) != JSON.stringify(config) ? '0' : '-1'
        "
        >Cancel changes</Button
      >
    </div>
  </div>
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
