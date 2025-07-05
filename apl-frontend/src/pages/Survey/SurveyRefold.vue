<script setup lang="ts">
import Listbox from "primevue/listbox";
import Logo from "../../assets/Logo.png";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import RadioButton from "primevue/radiobutton";
import { onMounted } from "vue";
import SelectButton from "primevue/selectbutton";
import { motion } from 'motion-v'
import PlexusEffect from "../../components/Common/PlexusEffect.vue";

const hasSeenRefold = defineModel<boolean | undefined>("refold");
const selectedStage = defineModel<any | undefined>("stage");

const options = [
  {
    label: "I don't know",
    description: "I don't know what stage I am at",
    value: "-1",
  },
  {
    label: "1",
    description:
      "You have started immersing and learning your first 1000 words",
    value: "1",
  },
  {
    label: "2A",
    description:
      "You have learned the top 1000 most common words, at a minimum. You also have a solid immersion routine.",
    value: "2A",
  },
  {
    label: "2B",
    description:
      "You have Level 3 comprehension in your strongest domain. This means you can recognize at least half of the words in your immersion content.",
    value: "2B",
  },
  {
    label: "2C",
    description:
      "You have reached Level 4 comprehension in your strongest domain. You are also starting to decrease your reliance on subtitles.",
    value: "2C",
  },
  {
    label: "3A",
    description:
      "You have reached Level 5 comprehension in your strongest domain. In this stage you will be preparing yourself for output.",
    value: "3A",
  },
  {
    label: "3B",
    description:
      "Output is no longer a source of anxiety for you. You are refining your output through corrections.",
    value: "3B",
  },
  {
    label: "3C",
    description:
      "You are continuing to refine your output ability through corrections and feedback. You are also approaching Level 6 comprehension in your strongest domain.",
    value: "3C",
  },
  {
    label: "4",
    description:
      "You can have comfortable and confident conversations with native speakers about every day topics. You are able to carry on conversations for at least an hour without stumbling over your words.",
    value: "4",
  },
];

onMounted(() => {
  selectedStage.value = undefined;
  hasSeenRefold.value = undefined;

  window.ipcRenderer.invoke("get-track-answer").then((data) => {
    if (data == "discord") {
      hasSeenRefold.value = true;
    }
  });
});

const router = useRouter();
function NextPage() {
  window.ipcRenderer
    .invoke("answer-survey-refold", {
      knows: hasSeenRefold.value,
      stage: selectedStage.value?.value,
    })
    .then((res: any) => {
      router.push("/survey/learning");
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
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{ duration:0.6 } }"
        class="flex flex-col flex-1 space-y-6"
      >
        <BackButton route="/survey/refold-intro"/>

        <h1 class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                   font-semibold text-white leading-tight">
          Have you heard of the Refold language learning methodology?
        </h1>
        <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed">
          An easy‐to‐follow process that takes you from zero to fluent.
        </p>

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <RadioButton
              v-model="hasSeenRefold"
              inputId="yes"
              name="refold"
              :value="true"
            />
            <label for="yes" class="text-lg text-white">Yes 🤘</label>
          </div>
          <div class="flex items-center gap-2">
            <RadioButton
              v-model="hasSeenRefold"
              inputId="no"
              name="refold"
              :value="false"
            />
            <label for="no" class="text-lg text-white">Never heard of it 🤔</label>
          </div>
        </div>

        <div v-if="hasSeenRefold" class="mt-6 w-full">
          <h2 class="text-2xl font-semibold text-white mb-2">
            What stage of Refold do you estimate to be at?
          </h2>
          <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] mb-4">
            Hover over each stage to learn more.
          </p>

          <SelectButton
            v-model="selectedStage"
            :options="options"
            optionLabel="label"
            dataKey="value"
            class="w-full"
            :optionStyle="{ width: '100%' }"
          >
            <template #option="slotProps">
              <div
                v-tooltip.bottom="{
                  value: slotProps.option.description,
                  pt: {
                    arrow: { style: {} },
                    text: { style: { fontSize:'0.8rem', textAlign:'center', color:'#fff' } }
                  }
                }"
                class="w-full px-4 py-2 hover:bg-zinc-800 rounded cursor-pointer text-white text-center"
              >
                {{ slotProps.option.label }}
              </div>
            </template>
          </SelectButton>
        </div>
      </motion.div>
      <div class="w-full flex justify-end mt-8">
        <Button
          label="Continue"
          @click="NextPage"
          class="w-[300px] p-3 rounded-full"
          :disabled="hasSeenRefold && !selectedStage"
        />
      </div>
    </div>

    <div class="flex-grow"></div>
  </div>
</template>