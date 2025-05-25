<script setup lang="ts">
import { useRouter } from "vue-router";
import Button from "primevue/button";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import AccountDisplay from "../../../components/Common/AccountDisplay.vue";
import BackButton from "../../../components/Common/BackButton.vue";
import RadioButton from "primevue/radiobutton";
import { onMounted, ref, watch } from "vue";
import { motion } from "motion-v";
import pluralize from "pluralize";
import MatureCardsIcon from "../../../../apl-backend/apl-visuals/public/Icons/MatureCards.svg";
import RetentionIcon from "../../../../apl-backend/apl-visuals/public/Icons/Retention.svg";
import ProgressSpinner from "primevue/progressspinner";

interface algorithm {
  key: string;
  name: string;
}

const retentionAlgorithms: algorithm[] = [
  { key: "true_retention", name: "TrueRetention (recommended)" },
  { key: "default_anki", name: "Default Anki Retention" },
];
const selectedAlgorithm = defineModel<string>("selectedAlgorithm");

onMounted(() => {
  selectedAlgorithm.value = retentionAlgorithms[0].key;
  window.ipcRenderer
    .invoke("anki-read-data", selectedAlgorithm.value)
    .then((data) => {
      cardCount.value = data.matureCardCount;
      retentionRate.value = data.retentionRate;
    });
});

watch(selectedAlgorithm, () => {
  window.ipcRenderer
    .invoke("anki-read-data", selectedAlgorithm.value)
    .then((data) => {
      cardCount.value = data.matureCardCount;
      retentionRate.value = data.retentionRate;
    });
});

const cardCount = ref<number>();
const retentionRate = ref<number>();

const router = useRouter();
function NextPage() {
  window.ipcRenderer.invoke("SetRetentionMode", selectedAlgorithm.value);
  router.push("/setup/pick-filename");
}
</script>

<template>
  <SetupBackground></SetupBackground>

  <div class="flex overflow-y-hidden">
    <div class="p-12 flex flex-col w-1/2 bg-black h-screen">
      <AccountDisplay />

      <div class="flex flex-col flex-grow py-5 text-left">
        <motion.div
          class="flex flex-col flex-grow items-start space-y-6"
          :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
          :animate="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.6 },
          }"
        >
          <BackButton route="/setup/anki-home" />

          <h1
            class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight"
          >
            Now let's try to read some data.
          </h1>

          <div
            class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed"
          >
            Now that anki is connected, here are some statistics. Please also
            use this opportunity to select your desired retention algorithm.
          </div>

          <div class="flex flex-col gap-6 pt-6">
            <div
              v-for="category in retentionAlgorithms"
              :key="category.key"
              class="flex items-center text-xl"
            >
              <RadioButton
                v-model="selectedAlgorithm"
                :inputId="category.key"
                name="dynamic"
                :value="category.key"
              />
              <label :for="category.key" class="ml-2 font-semibold px-1">
                {{ category.name }}
              </label>
            </div>
          </div>
          <div class="flex-grow" />
        </motion.div>
        <div class="flex justify-end pt-4">
          <Button @click="NextPage" class="w-[300px] p-3 !rounded-full">
            <span class="text-xl font-bold text-black">Continue</span>
          </Button>
        </div>
      </div>
    </div>

    <motion.div
      class="flex justify-center items-center flex-col gap-5 w-1/2"
      v-if="cardCount != undefined && retentionRate != undefined"
      :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
      :animate="{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.6 },
      }"
    >
      <div
        class="relative w-[400px] h-[200px] bg-black rounded-[20px] flex items-center justify-center"
      >
        <div class="absolute top-0 right-0">
          <div class="bg-white rounded-bl-xl rounded-tr-xl round p-2">
            <img :src="MatureCardsIcon" class="w-14 h-14" />
          </div>
        </div>
        <div class="flex w-4/5 justify-center h-20">
          <div class="flex-grow flex flex-col justify-center">
            <div class="font-bold text-xl text-gray-300 tracking-wider">
              Total Mature Cards
            </div>
            <div class="font-extrabold text-3xl">
              <div class="flex flex-row text-white">
                <div>
                  {{ pluralize("cards", cardCount, true) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="relative w-[400px] h-[200px] bg-black rounded-[20px] flex items-center justify-center"
      >
        <div class="absolute top-0 right-0">
          <div class="bg-white rounded-bl-xl rounded-tr-xl round p-2">
            <img :src="RetentionIcon" class="w-14 h-14" />
          </div>
        </div>
        <div class="flex w-4/5 justify-center h-20">
          <div class="flex-grow flex flex-col justify-center">
            <div class="font-bold text-xl text-gray-300 tracking-wider">
              Retention rate
            </div>
            <div class="font-extrabold text-3xl">
              <div class="flex flex-row text-white">
                <div>{{ retentionRate }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    <div v-else>
      <ProgressSpinner />
    </div>
  </div>
</template>
