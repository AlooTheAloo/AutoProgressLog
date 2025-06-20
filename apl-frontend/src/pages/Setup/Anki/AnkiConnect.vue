<script setup lang="ts">
import Logo from "../../../assets/Logo.png";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import AccountDisplay from "../../../components/Common/AccountDisplay.vue";
import BackButton from "../../../components/Common/BackButton.vue";
import AnkiLogo from "../../../assets/AnkiLogo.png";
import ProgressSpinner from "primevue/progressspinner";
import { ref } from "vue";
import Listbox from "primevue/listbox";
import { motion } from "motion-v";

const message = ref<string>();
const router = useRouter();
const profiles = ref<{ name: string; deckCount: number }[]>([]);
const selectedProfile = defineModel<{ name: string; deckCount: number }>();

const handleWorked = (worked: boolean) => {
  if (worked == null) return;
  if (worked) {
    router.push("/setup/anki-success");
  } else {
    router.push("/setup/anki-failure");
  }
};

function startTimer() {
  countdown.value = 30;
  timerId = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timerId!);
      timerId = null;
    }
  }, 1000);
}

window.ipcRenderer.on(
  "anki-multiple-profiles-detected",
  (sender, p: { name: string; deckCount: number }[]) => {
    profiles.value = p;
  }
);

window.ipcRenderer.on("anki-connect-message", (sender, m: any) => {
  message.value = m;
});

window.ipcRenderer.invoke("anki-connect-start").then(handleWorked);

function SelectProfile() {
  window.ipcRenderer
    .invoke("anki-profile-select", selectedProfile.value?.name)
    .then(handleWorked);
  profiles.value = [];
  selectedProfile.value = undefined;
}
</script>

<template>
  <SetupBackground />

  <div class="flex w-screen">
    <div
      class="p-4 sm:p-12 flex flex-col h-screen w-full max-w-[60rem] bg-black"
    >
      <div class="space-y-6">
        <div class="flex w-full items-center justify-between">
          <img :src="Logo" class="w-16 h-16 sm:w-20 sm:h-20" alt="APL logo" />
          <AccountDisplay />
        </div>
        <h1
          class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight"
        >
          {{
            profiles.length === 0
              ? "Connecting to Anki..."
              : "We found multiple Anki profiles."
          }}
        </h1>
        <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0]">
          {{
            profiles.length === 0
              ? "If this process is taking too long, please verify your Internet connection and AnkiWeb connection settings"
              : "Please select the profile you would like to connect to."
          }}
        </p>
      </div>
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.6 },
        }"
        class="flex flex-1 w-full justify-center items-center"
      >
        <template v-if="profiles.length === 0">
          <div class="flex flex-col items-center gap-4 -mt-8">
            <div class="flex gap-4 items-center">
              <img :src="AnkiLogo" class="w-12" alt="Anki icon" />
              <ProgressSpinner style="width: 50px; height: 50px" />
              <img :src="Logo" class="w-14" alt="APL logo" />
            </div>
            <div class="text-2xl font-semibold text-white text-center">
              {{ message }}...
            </div>
          </div>
        </template>
        <template v-else>
          <Listbox
            v-model="selectedProfile"
            :options="profiles"
            optionLabel="name"
            class="w-full max-w-[24rem]"
          >
            <template #option="{ option }">
              <div
                class="p-4 bg-[#18181B] rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <div class="font-semibold text-white">{{ option.name }}</div>
                <div class="text-sm text-gray-400">
                  {{ option.deckCount }} decks
                </div>
              </div>
            </template>
          </Listbox>
        </template>
      </motion.div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
