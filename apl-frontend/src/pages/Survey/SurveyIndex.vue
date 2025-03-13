<script setup lang="ts">
import Listbox from "primevue/listbox";
import Logo from "../../assets/Logo.png";
import Button from "primevue/button";
import { useRouter } from "vue-router";

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
  <div class="flex w-screen">
    <div class="p-12 flex flex-col w-full bg-black h-screen">
      <div class="pb-2">
        <img :src="Logo" class="w-12 h-12" />
      </div>
      <div class="font-semibold text-white text-4xl">
        How did you find out about AutoProgressLog?
      </div>
      <p class="text-sm"></p>
      <div class="flex flex-grow items-center">
        <Listbox
          scroll-height="none"
          v-model="selectedOption"
          :options="options"
          style="gap: 2px"
          class="w-full"
        >
          <template
            #option="slotProps: {
              option: { label: string; value: string };
              index: number;
            }"
          >
            <div class="w-full flex flex-col">
              <div class="flex flex-col jusitfy-center h-full">
                <div class="font-semibold text-md">
                  {{ slotProps.option.label }}
                </div>
                <div class="text-sm">
                  {{}}
                </div>
              </div>
            </div>
          </template>
        </Listbox>
      </div>

      <Button
        :disabled="selectedOption == null"
        label="Continue"
        @click="NextPage"
      ></Button>
    </div>
  </div>
</template>
