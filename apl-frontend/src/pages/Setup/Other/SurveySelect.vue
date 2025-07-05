<script setup lang="ts">
import { useRouter } from 'vue-router'
import { motion } from 'motion-v'

import SetupBackground from '../../../components/Setup/SetupBackground.vue'
import AccountDisplay   from '../../../components/Common/AccountDisplay.vue'
import BackButton       from '../../../components/Common/BackButton.vue'
import Logo             from '../../../assets/Logo.png'
import Button           from 'primevue/button'
import PlexusEffect from "../../../components/Common/PlexusEffect.vue";
const router = useRouter()

function StartSurvey() {
  router.push('/survey/index')
}
function FinishSetup() {
  router.push('/setup/complete')
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

      <div class="space-y-6">
        <div class="flex w-full items-center justify-between">
          <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20"/>
          <AccountDisplay/>
        </div>
      <motion.div
        :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
        :animate="{ opacity: 1, y: 0, filter: 'blur(0px)', transition:{ duration:0.6 } }"
        class="flex flex-col items-start space-y-6 w-full"
      >
      <BackButton route="/setup/pick-filename"/>
        <h1
          class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                 font-semibold text-white leading-tight"
        >
          Would you like to answer a few questions to help us improve AutoProgressLog?
        </h1>
        <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed">
          This survey is completely optional and will not collect any personal information.
          We use the data to get a sense of how AutoProgressLog is being used and to make improvements.
        </p>
      </motion.div>
    </div>

    <div class="w-full flex justify-end gap-8">
        <Button
          label="No thanks"
          link
          style="font-size:18px; padding:0"
          @click="FinishSetup"
        />
        <Button
          @click="StartSurvey"
          class="w-[300px] p-3 rounded-full"
        >
          <span class="text-xl font-bold text-black">Yes</span>
        </Button>
      </div>
  </div>
  <div class="flex-grow"/>
</div>
</template>
