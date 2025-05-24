<script setup lang="ts">
import Button from "primevue/button";
import { ref, shallowRef } from "vue";
import ConfirmPopup from "primevue/confirmpopup";
import { useConfirm } from "primevue/useconfirm";
import Toast from "primevue/toast";
import { getHelpCenter, HelpPage } from "../../services/helpService";
import { AnimatePresence, motion } from "motion-v";

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
    <!-- DETAIL PANEL -->
    <AnimatePresence :initial="false">
      <motion.div
        v-if="selectedGuide != undefined"
        key="help-page"
        class="flex absolute h-[calc(100vh-5rem)] w-[calc(87vw-5rem)] lg:mx-20 mx-10 mt-10 overflow-y-scroll flex-grow"
        :initial="{ x: 50, opacity: 0, filter: 'blur(10px)' }"
        :while-in-view="{ x: 0, opacity: 1, filter: 'blur(0px)' }"
        :exit="{ x: 50, opacity: 0, filter: 'blur(10px)' }"
        :transition="{ duration: 0.25, ease: 'easeInOut' }"
      >
        <div class="flex flex-col items-start w-[calc(87vw-5rem)]">
          <Button
            link
            style="padding: 0"
            label="Go back"
            icon="pi-angle-left pi"
            @click="selectedGuide = undefined"
            class="p-0 h-8"
          />
          <component :is="selectedGuide.component" />
        </div>
      </motion.div>
    </AnimatePresence>

    <!-- LIST PANEL -->
    <AnimatePresence :initial="false">
      <motion.div
        v-if="selectedGuide == undefined"
        key="default"
        class="flex flex-col flex-grow h-full"
        :initial="{ x: -50, opacity: 0, filter: 'blur(10px)' }"
        :while-in-view="{ x: 0, opacity: 1, filter: 'blur(0px)' }"
        :exit="{ x: -50, opacity: 0, filter: 'blur(10px)' }"
        :transition="{ duration: 0.25, ease: 'easeInOut' }"
      >
        <div class="flex flex-col w-full h-screen px-12 pt-12 pb-6 space-y-6">
          <!-- header aligned with cards -->
          <div class="space-y-2">
            <h1
              class="bg-gradient-to-r bg-clip-text text-4xl font-extrabold text-transparent from-[#89BDFF] to-[#40ffff]"
            >
              Help Center
            </h1>
            <h2 class="text-lg dark:text-slate-200 text-slate-800">
              Explore guides and find answers to your questions here.
            </h2>
          </div>

          <!-- cards list -->
          <div class="flex flex-col flex-grow overflow-y-auto space-y-4">
            <motion.div
              v-for="(page, i) in guides"
              :key="i"
              class="flex justify-between items-center gap-4 h-20 w-full dark:bg-black bg-[#eeeeef] text-white rounded-xl p-5 border-2 border-transparent hover:border-[var(--primary-color)] transition-all duration-200"
              :initial="{ opacity: 0 }"
              :while-in-view="{ opacity: 1 }"
              :inViewOptions="{ amount: 0, once: false }"
              @click="onPageSelect(page)"
              role="button"
              tabindex="0"
            >
              <img
                :src="page.icon"
                class="w-8 h-8 dark:invert-0 invert"
                alt="icon"
              />
              <div
                class="flex flex-col flex-grow cursor-pointer text-black dark:text-white w-0"
              >
                <h3 class="text-xl font-semibold truncate">
                  {{ page.title }}
                </h3>
                <p class="truncate text-gray-600 dark:text-gray-400">
                  {{ page.description }}
                </p>
              </div>
              <Button
                severity="info"
                class="w-10 h-10 flex items-center justify-center p-0"
                @click="onPageSelect(page)"
                tabindex="-1"
              >
                <i class="pi pi-arrow-right text-xl text-white"></i>
              </Button>
            </motion.div>
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
  background-color: var(--primary-color); /* Thumb color */
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
