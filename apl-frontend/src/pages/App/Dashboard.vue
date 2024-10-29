<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import SideBarContainer from "../../components/Common/SideBarContainer.vue";
import { appPath } from "../routes/appRoutes";
import ProgressSpinner from "primevue/progressspinner";
import dayjs from "dayjs";
import { DashboardDTO } from "../../../types/DTO";
import DashboardBody from "../../components/Dashboard/DashboardBody.vue";
import { useMagicKeys } from '@vueuse/core'

const timeUpdateInterval = 30000;
const router = useRouter();
const { shift } = useMagicKeys();

const syncing = ref<boolean>(false);
const dto = ref<DashboardDTO>();
const lastSyncTime = computed(() => {
  if (!dto.value?.lastSyncTime) return '';
  return dayjs.duration(-dayjs().diff(dto.value.lastSyncTime)).humanize(true);
});

async function generateReport() {
  try {
    syncing.value = true;
    dto.value = await window.ipcRenderer.invoke("GenerateReport");
  } catch (error) {
    console.error("Error generating report:", error);
    // Handle error (e.g., show error message to user)
  } finally {
    syncing.value = false;
  }
}

async function sync() {
  try {
    syncing.value = true;
    dto.value = await window.ipcRenderer.invoke("Sync", shift.value);
  } catch (error) {
    console.error("Error syncing:", error);
    // Handle error (e.g., show error message to user)
  } finally {
    syncing.value = false;
  }
}

onMounted(async () => {
  try {
    const data: DashboardDTO = await window.ipcRenderer.invoke("Get-Dashboard-DTO");
    if (data.syncCount === 0) {
      await sync();
    } else {
      dto.value = data;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Handle error (e.g., show error message to user)
  }
});

</script>

<template>
    <SideBarContainer :currentRoute="router.currentRoute.value.path as appPath">
        <div v-if="!dto" class="flex flex-col w-full h-full items-center justify-center">
            <ProgressSpinner />
        </div>
        <div v-else class="flex flex-col w-full h-full">
            <div class="flex flex-col flex-grow w-full h-full">
                <div class="flex w-full h-32 items-center px-10 justify-between">
                    <div class="flex flex-col">
                        <h1 class="bg-gradient-to-r bg-clip-text text-xl xl:text-4xl font-extrabold text-transparent from-[#89BDFF] to-[#40376B]">
                            Hi, {{ dto.userName }}!
                        </h1>
                        <div class="flex items-center">
                            <p class="text-xl">Last synced {{ lastSyncTime }}</p>
                            <Button class="h-6 ml-2" plain text @click="sync" :loading="syncing">
                                <span class="font-semibold text-[#00E0FF]">Sync Now</span>
                                <i :class="['pi', syncing ? 'pi-spinner pi-spin' : 'pi-sync', 'text-[#00E0FF]']" />
                            </Button>
                        </div>
                    </div>
                    <Button severity="info" @click="generateReport" :disabled="syncing">
                        <i class="pi pi-plus-circle text-white mr-2" />
                        <span class="text-white font-bold">Generate Report</span>
                    </Button>
                </div>
                <div class="flex w-full items-center px-10">
                    <DashboardBody :dto="dto" />
                </div>
            </div>
        </div>
    </SideBarContainer>
   
</template>
