<script setup lang="ts">
import Button from "primevue/button";
import DataView from "primevue/dataview";
import { ref, onMounted, shallowRef } from "vue";
import { useRouter } from "vue-router";
import dayjs, { Dayjs } from "dayjs";
import ProgressSpinner from "primevue/progressspinner";
import { PageState } from "primevue/paginator";
import Skeleton from "primevue/skeleton";
import score from "../../../src/assets/rewarded.png";
import ConfirmPopup from "primevue/confirmpopup";
import { useConfirm } from "primevue/useconfirm";
import { CopyReportToast } from "../../../electron/main/Electron-Backend/ReportsListeners";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { getHelpCenter, HelpPage } from "../../services/helpService";
import { AnimatePresence, motion } from "motion-v";
import BackButton from "../../components/Common/BackButton.vue";

type ListReport = {
  id: string;
  score: number;
  date: Dayjs;
  fileExists: boolean;
  revertable?: boolean;
};

onMounted(() => {});

const guides = ref<HelpPage[]>(getHelpCenter());
const selectedGuide = shallowRef<HelpPage | undefined>(undefined);

function onPageSelect(page: HelpPage) {
  selectedGuide.value = page;
}
</script>

<template>
  <Toast />
  <ConfirmPopup />
  <div class="flex-grow h-full flex relative w-full">
    <AnimatePresence :initial="false">
      <motion.div
        v-if="selectedGuide != undefined"
        key="help-page"
        class="flex flex-col absolute h-[calc(100vh-5rem)] lg:mx-20 mx-10 mt-10 overflow-y-scroll flex-grow w-5/6"
        :initial="{
          x: 50,
          opacity: 0,
          filter: 'blur(10px)',
        }"
        :while-in-view="{
          x: 0,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :exit="{
          x: 50,
          opacity: 0,
          filter: 'blur(10px)',
        }"
        :transition="{
          duration: 0.5,

          ease: 'easeInOut',
        }"
      >
        <div class="w-fit h-8">
          <Button
            link
            style="padding: 0"
            label="Go back"
            icon="pi-angle-left pi"
            @click="selectedGuide = undefined"
            class="p-0 h-8"
          />
          <component :is="selectedGuide.component"></component>
        </div>
      </motion.div>
    </AnimatePresence>
    <AnimatePresence :initial="false">
      <motion.div
        v-if="selectedGuide == undefined"
        key="default"
        class="flex flex-col flex-grow h-full"
        :initial="{
          x: -50,
          opacity: 0,
          filter: 'blur(10px)',
        }"
        :while-in-view="{
          x: 0,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :exit="{
          x: -50,
          opacity: 0,
          filter: 'blur(10px)',
        }"
        :transition="{
          duration: 0.5,

          ease: 'easeInOut',
        }"
      >
        <div class="flex flex-col w-full h-screen px-40 py-20">
          <div class="flex w-full h-20 items-center my-5 justify-between">
            <div class="flex flex-col">
              <h1 class="text-white text-4xl font-extrabold">Help center</h1>
              <h2>Explore guides and find answers to your questions here.</h2>
            </div>
          </div>
          <div class="flex w-full h-0 flex-grow mb-10">
            <div
              class="flex w-full px-2 flex-grow overflow-y-auto overflow-x-hidden rounded-lg flex-col gap-4"
            >
              <motion.div
                style="opacity: 0"
                v-for="(page, i) in guides"
                :key="i"
                :initial="{ opacity: 0 }"
                :while-in-view="{ opacity: 1 }"
                :inViewOptions="{ amount: 0, once: false }"
                class="flex justify-between items-center gap-2 h-20 w-full bg-[#242424] rounded-xl p-5"
              >
                <img :src="page.icon" class="w-6 h-6 pr-1"  alt="icon"/>
                <div class="flex flex-col w-0 flex-grow">
                  <h1 class="text-white text-xl font-extrabold truncate">
                    {{ page.title }}
                  </h1>
                  <h2 class="truncate">
                    {{ page.description }}
                  </h2>
                </div>
                <Button
                  severity="info"
                  class="w-12 h-8"
                  @click="onPageSelect(page)"
                >
                  <div class="text-white">
                    <i class="pi pi-arrow-right text-sm"></i>
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
<style>
/* For Webkit browsers (Chrome, Edge, Safari) */
::-webkit-scrollbar {
  width: 8px; /* or whatever width you want */
}

::-webkit-scrollbar-track {
  background: transparent; /* Make the track transparent */
}

::-webkit-scrollbar-thumb {
  background-color: #24caff; /* Thumb color */
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:click {
  border-radius: 10px;
}

/* Optional: hide scrollbar track shadow if needed */
::-webkit-scrollbar-track-piece {
  background: transparent;
}
</style>
