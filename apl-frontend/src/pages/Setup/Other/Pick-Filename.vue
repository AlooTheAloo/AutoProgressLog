<script setup lang="ts">
import Logo from "../../../assets/Logo.png";
import { useRouter } from "vue-router";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Button from "primevue/button";
import BackButton from "../../../components/Common/BackButton.vue";
import PlexusEffect from "../../../components/Common/PlexusEffect.vue";
import InputText from "primevue/inputtext";
import { onMounted, ref } from "vue";
import Dropdown from "primevue/dropdown";
import AccountDisplay from "../../../components/Common/AccountDisplay.vue";
import Panel from "primevue/panel";
import { reportExtensions } from "../../../../apl-backend/types/options";
import { motion } from 'motion-v'

const extensions = reportExtensions;

const selectedExtension = defineModel<string>("selectedExtension");
const filename = defineModel<string>("filename");
const filePath = ref("");

onMounted(() => {
  window.ipcRenderer.invoke("GetPath", "userData").then((path) => {
    filePath.value = path;
  });

  filename.value = "Progress Report";
  selectedExtension.value = extensions.at(0);
});

function chooseFilePath() {
  window.ipcRenderer.invoke("OpenPathDialog", filePath.value).then((path) => {
    if (!path || path.length == 0) return;
    filePath.value = path[0];
  });
}

const router = useRouter();
function NextPage() {
  window.ipcRenderer.invoke("SetOutputFile", {
    path: filePath.value,
    name: filename.value,
    extension: selectedExtension.value,
  });
  router.push("/setup/pick-survey");
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
    <div class="flex flex-col items-start space-y-10 w-full">
        <img
          :src="Logo"
          alt="APL Logo"
          class="w-16 h-16 sm:w-20 sm:h-20 block"
        />
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{duration:0.6}}"
        class="flex flex-col items-start space-y-6"
      >
        <BackButton route="/setup/anki-home"/>
        <h1 class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                   font-semibold text-white leading-tight">
                   Select where to save your progress reports
        </h1>
        <div class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed">
          Your progress reports will be saved under this name with a number
            suffix. For example, if you choose “MyReport.png”, your reports
            will be saved as “MyReport 1.png”, “MyReport 2.png”, etc.
        </div>
        <div class="flex flex-col gap-3 w-full">
  <Button
    class="w-full text-left p-3 bg-[#18181B] rounded-xl"
    @click="chooseFilePath"
  >
    <div class="flex flex-col w-full text-left">
      <div class="text-sm truncate">{{ filePath }}</div>
      <div class="text-xs text-[#C0C0C0]">(Click to edit)</div>
    </div>
  </Button>

    <div class="flex gap-2 w-full">
    <div class="flex flex-col gap-1 flex-1">
      <label class="text-lg text-white font-semibold">
        Report name
      </label>
      <InputText
        v-model="filename"
        placeholder="Report name"
        class="w-full text-white font-semibold rounded-xl p-2 h-12"
      />
    </div>
    <div class="flex flex-col gap-1 w-1/4">
      <label class="text-lg text-white font-semibold">
        Extension
      </label>
      <Dropdown
        v-model="selectedExtension"
        :options="extensions"
        class="w-full text-white font-semibold text-lg rounded-xl h-12"
      />
    </div>
  </div>
</div>
      </motion.div>
    </div>
      <div class="w-full flex justify-end">
        <Button
          @click="NextPage"
          class="w-[300px] p-3 rounded-full"
          >
          <span class="text-xl font-bold text-black">Continue</span>
        </Button>
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
<style scoped>
</style>
