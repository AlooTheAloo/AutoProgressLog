<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import Logo from "../../../assets/Logo.png"
import SetupBackground from "../../../components/Setup/SetupBackground.vue"
import Button from "primevue/button"
import BackButton from "../../../components/Common/BackButton.vue"
import Password from "primevue/password"
import { motion } from 'motion-v'
import ToggleIcon from '../../../assets/Toggl.svg'
import { useWindowSize } from "@vueuse/core"

const apiKey = ref('')
const router = useRouter()
const { height } = useWindowSize()

function OpenTogglTrackPage() {
  window.ipcRenderer.invoke("OpenExternal", "https://track.toggl.com/profile")
}

function CreateAccount() {
  window.ipcRenderer.invoke("OpenExternal", "https://accounts.toggl.com/track/signup/")
}

async function NextPage() {
  if (!apiKey.value.trim()) {
    return
  }
  await window.ipcRenderer.invoke("toggl-api-key-set", apiKey.value)
  router.push("/setup/toggl-success")
}
</script>

<template>
  <SetupBackground/>
  <div class="flex w-screen">
    <div
      class="p-4 sm:p-12
             flex flex-col justify-between
             w-full max-w-[60rem] bg-black min-h-screen"
    >
    <div class="flex flex-col items-start space-y-6 w-full">
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
        <BackButton route="/setup/client-server-selection"/>
        <h1 class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
                   font-semibold text-white leading-tight">
          Connect to your Toggl Track account
        </h1>
        <div class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed">
          Please enter your Toggl Track API Token. This key can be found at the
          bottom of your profile settings page.<br />
          If you don't have an account, you can create one          
          <Button
          link
          style="padding: 0"
          label="here"
          @click="CreateAccount"
          class="p-0 h-8 !text-blue-400 hover:!text-blue-600"
        />
        </div>
        <div class="my-3">
          <Button
            @click="OpenTogglTrackPage"
            class="w-[300px] p-3 !rounded-full
                   !bg-[#731768] !text-white
                   hover:!bg-[#5a1058] flex items-center
                   !border-none focus:outline-none"
          >
            <img
              :src="ToggleIcon"
              alt="Toggl Track"
              class="w-8 h-8 mr-2 flex-shrink-0"
            />
            <span>Open toggl track profile page</span>
          </Button>
        </div>
        <div class="w-full">
          <div class="text-lg mb-2 text-white">API Token</div>
          <Password
            v-model="apiKey"
            fluid
            class="w-full"
            :feedback="false"
            placeholder="Enter your API token here"
          />
        </div>
      </motion.div>
    </div>
      <div class="flex justify-end">
        <Button
          @click="NextPage"
          :disabled="!apiKey"
          class="w-[300px] p-3 !rounded-full"
          :class="!apiKey ? 'opacity-50 cursor-not-allowed' : 'opacity-100'"
          >
          <span class="text-xl font-bold text-black">Continue</span>
        </Button>
      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
