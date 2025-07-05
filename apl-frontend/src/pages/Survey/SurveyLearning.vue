<script setup lang="ts">
import {
  ES,
  JP,
  US,
  FR,
  DE,
  KR,
  CN,
  RU,
  IT,
  NE,
  PR,
  CZ,
  SA,
  HK,
  PH,
  PS,
  NO,
  ID,
  TH,
  AQ,
  PT,
  NL,
  AL,
  AG,
  DZ,
} from "country-flag-icons/string/3x2";
import Listbox from "primevue/listbox";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import Logo from "../../assets/Logo.png";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import { onMounted, ref, watch } from "vue";
import SelectButton from "primevue/selectbutton";
import { useWindowSize } from "@vueuse/core";
import { motion } from 'motion-v';
import PlexusEffect from "../../components/Common/PlexusEffect.vue";

const active = ref<string | undefined>("0");
const panel = defineModel<number>("a");
const selectedYears = defineModel<{ label: string; value: string } | undefined>(
  "years",
);
const selectedLanguage = defineModel<
  { label: string; value: string } | undefined
>("language");

const { width, height } = useWindowSize();

watch(selectedLanguage, () => {
  if (selectedLanguage.value == undefined) return;
  active.value = "1";
});

const timeList = [
  {
    label: "Less than 1 year",
    value: "0",
  },
  {
    label: "1 year",
    value: "1",
  },
  {
    label: "2 years",
    value: "2",
  },
  {
    label: "3 years",
    value: "3",
  },
  {
    label: "4 years",
    value: "4",
  },
  {
    label: "More than 4 years",
    value: "5",
  },
  {
    label: "I don't know",
    value: "-1",
  },
];

const languageList = [
  {
    label: "Japanese",
    value: "jp",
    flag: JP,
  },
  {
    label: "Spanish",
    value: "es",
    flag: ES,
  },
  {
    label: "English",
    value: "en",
    flag: US,
  },
  {
    label: "French",
    value: "fr",
    flag: FR,
  },
  {
    label: "German",
    value: "de",
    flag: DE,
  },
  {
    label: "Korean",
    value: "kr",
    flag: KR,
  },
  {
    label: "Mandarin",
    value: "cn",
    flag: CN,
  },
  {
    label: "Russian",
    value: "ru",
    flag: RU,
  },
  {
    label: "Italian",
    value: "it",
    flag: IT,
  },
  {
    label: "Dutch",
    value: "nl",
    flag: NL,
  },
  {
    label: "Portugese",
    value: "pt",
    flag: PT,
  },
  {
    label: "Czech",
    value: "cz",
    flag: CZ,
  },
  {
    label: "Arabic",
    value: "dz",
    flag: DZ,
  },
  {
    label: "Cantonese",
    value: "hk",
    flag: HK,
  },
  {
    label: "Tagalog",
    value: "ph",
    flag: PH,
  },
  {
    label: "Hebrew",
    value: "ps",
    flag: PS,
  },
  {
    label: "Norwegian",
    value: "no",
    flag: NO,
  },
  {
    label: "Indonesian",
    value: "id",
    flag: ID,
  },
  {
    label: "Thai",
    value: "th",
    flag: TH,
  },
  {
    label: "Other",
    value: "other",
    flag: AQ,
  },
];

onMounted(() => {
  selectedLanguage.value = undefined;
  selectedYears.value = undefined;
  panel.value = 0;
});

const router = useRouter();
function NextPage() {
  window.ipcRenderer
    .invoke(
      "answer-survey-language",
      selectedLanguage.value?.value,
      parseInt(selectedYears.value?.value ?? "-2"),
    )
    .then((res: any) => {
      router.push("/survey/apps");
    });
}
</script>

<template>
  <SetupBackground/>
  <div
    :style="{ backgroundImage: `linear-gradient(to bottom right, #add8ff, #d8b4fe)` }"
    class="relative flex items-center justify-start h-screen pl-12"
  >
    <PlexusEffect class="absolute inset-0 z-0" />

    <!-- Card -->
    <div
      class="
        relative z-10
        bg-black rounded-3xl p-12

        /* 1) column flex that spans full height */
        flex flex-col justify-between items-start
        h-[90vh] max-h-[946px]  /* your height rules */

        /* 2) width clamped between min & max */
        w-full max-w-[899px] min-w-[600px]
      "
    >
      <div class="flex w-full items-center justify-between mb-6">
        <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20"/>
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
          Tell us more about your learning journey.
        </h1>
        <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed">
          We’d love to know which language you’re studying and for how long.
        </p>

        <Accordion v-model:value="active" class="bg-[#18181B] rounded-lg p-2 space-y-4">
          <AccordionPanel value="0">
            <AccordionHeader>
              <div class="font-semibold text-white text-2xl">
                What language are you learning?
              </div>
            </AccordionHeader>
            <AccordionContent>
              <p class="pb-4 text-[#C0C0C0]">
                If you study multiple, choose the one you feel most comfortable with.
              </p>
              <Listbox
                v-model="selectedLanguage"
                :options="languageList"
                optionLabel="label"
                :scrollHeight="height > 800 ? '215px' : height/3 + 'px'"
                class="w-full"
              >
                <template #option="{ option }">
                  <div class="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded cursor-pointer">
                    <span class="w-6" v-html="option.flag"></span>
                    <span class="text-white font-semibold">{{ option.label }}</span>
                  </div>
                </template>
              </Listbox>
            </AccordionContent>
          </AccordionPanel>
          <AccordionPanel value="1">
            <AccordionHeader>
              <div class="font-semibold text-white text-2xl">
                How long have you been learning this language for?
              </div>
            </AccordionHeader>
            <AccordionContent>
              <p class="pb-2 text-[#C0C0C0]">
                A rough estimate is fine—pick the closest range.
              </p>
              <SelectButton
              v-model="selectedYears"
              :options="timeList"
              optionLabel="label"
              dataKey="value"
              class="w-full"
              :optionStyle="{ width: '100%' }"
            >
              <template #option="{ option }">
                <div
                  v-tooltip.bottom="{
                    value: option.description,
                    pt: {
                      arrow: { style: {} },
                      text: { style: { fontSize: '0.8rem', textAlign: 'center', color: 'white' } }
                    }
                  }"
                  class="w-full text-center px-4 py-2 hover:bg-zinc-800 rounded cursor-pointer text-white"
                >
                  {{ option.label }}
                </div>
              </template>
            </SelectButton>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </motion.div>

      <div class="w-full flex justify-end mt-8">
        <Button
          label="Continue"
          @click="NextPage"
          class="w-[300px] p-3 rounded-full"
          :disabled="!selectedLanguage || !selectedYears"
        />
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>