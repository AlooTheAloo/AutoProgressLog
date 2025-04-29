<script setup lang="ts">
import Listbox from "primevue/listbox";
import Logo from "../../assets/Logo.png";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import { motion } from 'motion-v'

const options = [
  { label: "🫂 A friend's recommendation", value: "friend" },
  { label: "📱 A social media post", value: "social" },
  { label: "🌐 The APL website or github", value: "website" },
  { label: "📋 The Refold discord server", value: "discord" },
  { label: "❤️ I'm friends with someone on the dev team", value: "dev" },
  { label: "🤔 Other", value: "other" },
];

const selectedOption = defineModel<
  { label: string; value: string } | undefined
>("track");

const router = useRouter();
function NextPage() {
  window.ipcRenderer
    .invoke("answer-survey-track", selectedOption.value?.value)
    .then((res: any) => {
      router.push("/survey/refold");
    });
}
</script>

<template>
  <SetupBackground/>

  <div class="flex w-screen">
    <div
      class="p-4 sm:p-12
             flex flex-col justify-between
             h-screen w-full max-w-[60rem] bg-black"
    >

      <div class="flex w-full items-center justify-between">
          <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20 mb"/>
          <AccountDisplay/>
        </div>
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{ duration: 0.6 } }"
        class="flex flex-col flex-1 space-y-6"
      >
        <h1
          class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                 font-semibold text-white leading-tight"
        >
          How did you find out about AutoProgressLog?
        </h1>
        <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed">
          Select the option that best applies:
        </p>
        <Listbox
          v-model="selectedOption"
          :options="options"
          optionLabel="label"
          scroll-height="450px"
          class="w-full p-2 bg-[#18181B] rounded-lg"
        >
          <template #option="{ option }">
            <div class="w-full p-3 hover:bg-zinc-800 cursor-pointer rounded">
              <div class="font-semibold text-white">{{ option.label }}</div>
            </div>
          </template>
        </Listbox>
      </motion.div>
      <div class="flex justify-end">
        <Button
          label="Continue"
          @click="NextPage"
          class="w-[300px] p-3 !rounded-full"
          :disabled="!selectedOption"
        />
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
