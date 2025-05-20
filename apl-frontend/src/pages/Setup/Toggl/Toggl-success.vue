<script setup lang="ts">
import Logo from "../../../assets/Logo.png";
import { useRouter } from "vue-router";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Button from "primevue/button";
import BackButton from "../../../components/Common/BackButton.vue";
import { onMounted, ref } from "vue";
import ProgressSpinner from "primevue/progressspinner";
import { TogglAccount } from "../../../../types/TogglAccount";
import { motion } from 'motion-v';

const togglAccount = ref<TogglAccount | undefined>(undefined);
const router = useRouter();

onMounted(async () => {
  togglAccount.value = await window.ipcRenderer.invoke("toggl-account-get");
  if (togglAccount.value === undefined) {
    router.push("/setup/toggl-failure");
  }
});

function NextPage() {
  router.push("/setup/anki-home");
}
</script>

<template>
  <SetupBackground></SetupBackground>
  <div class="flex w-screen">
  <div class="p-4 sm:p-12
             flex flex-col justify-between
             w-full max-w-[60rem] bg-black min-h-screen">
  <div class="flex flex-col items-start space-y-6 w-full">
        <img
          :src="Logo"
          alt="APL Logo"
          class="w-16 h-16 sm:w-20 sm:h-20 block"
        />  
    <ProgressSpinner
      v-if="togglAccount === undefined"
      class="flex-grow w-full h-full"
    ></ProgressSpinner>
    <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{duration:0.6}}"
        class="flex flex-col items-start space-y-6"
      >
      <BackButton route="/setup/toggl-manual-connect" />
      <h1 class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                   font-semibold text-white leading-tight">
          The account was succesfully connected !
        </h1>
        <div class="w-full flex items-center">
        <div class="w-full h-16 bg-[#18181B] rounded-xl p-5 flex flex-col">
          <div class="flex gap-5 items-center justify-between h-full">
            <div class="flex gap-5 min-w-0">
              <img
                :src="togglAccount?.pfp_url"
                :alt="togglAccount?.name"
                class="h-8 w-8 rounded-md min-w-[2rem]"
              />
              <div class="font-semibold text-md truncate min-w-0 flex items-center">
                {{ togglAccount?.name }}
              </div>
            </div>
            <i class="pi pi-check-circle" style="color: #00ff00"></i>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
      <div class="flex justify-end">
        <Button
          @click="NextPage"
          class="w-[300px] p-3 !rounded-full"
          >
          <span class="text-xl font-bold text-black">Continue</span>
        </Button>
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
