<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import BackButton from "../../../components/Common/BackButton.vue";
import PlexusEffect from "../../../components/Common/PlexusEffect.vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Logo from "../../../assets/Logo.png";
import { ThemeManager } from "../../../util/theme-manager";
import { motion } from "motion-v";
import { z } from "zod";

const router = useRouter();
const { height } = useWindowSize();

const email = ref("");
const isEmailValid = computed(() => {
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  return re.test(email.value.trim());
});

const emailSent = ref(false);
const countdown = ref(0);
let timerId: number | null = null;

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

function SendEmail() {
  if (!isEmailValid.value) return;
  emailSent.value = true;
  window.ipcRenderer.invoke("Send-Email", email.value);
  startTimer();
}

function NextPage() {
  router.push("/setup/auth-success");
}

const protocolSchema = z.object({
  email: z.string().email(),
  token: z.string(),
});

onMounted(() => {
  window.ipcRenderer.on("open-url", async (evt, data: string) => {
    const url = new URL(data);
    if (url.hostname !== "auth") return;
    const parsed = Object.fromEntries(url.searchParams);
    const result = protocolSchema.safeParse(parsed);
    if (!result.success) {
      alert("Invalid data received from url. Please try again.");
      return;
    }
    const { email, token } = result.data;
    const resp = await window.ipcRenderer.invoke(
      "approve-email-token",
      email,
      token,
      window.navigator.userAgent
    );

    if (!resp) {
      alert("Invalid email or token");
    } else if (resp == "login") {
      router.push("/setup/auth-success");
    } else if (resp == "signup") {
      router.push("/app/dashboard");
    }
  });
});
onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});
</script>

<template>
  <SetupBackground />
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
      <!-- Top block: logo + back button + intro -->
      <div class="space-y-6 w-full">
        <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20" />

        <BackButton route="/setup/index" />

        <motion.div
          :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
          :animate="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 1 },
          }"
          class="flex flex-col items-start space-y-4 w-full"
        >
          <h1
            class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight"
          >
            Let's start with your email.
          </h1>
          <p class="text-xs sm:text-sm lg:text-base text-[#C0C0C0]">
            Please provide a valid email address. We’ll send you a link so you
            can either create an account or log in.
          </p>
          <div class="w-full">
            <InputText
              v-model="email"
              placeholder="john.doe@example.com"
              :disabled="emailSent"
              class="w-full"
            />
            <motion.p
              v-if="emailSent"
              :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
              :animate="{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: { duration: 1 },
              }"
              class="text-green-400 text-sm font-medium mt-1"
            >
              ✅ Check your inbox.
            </motion.p>
          </div>
        </motion.div>
      </div>

      <!-- Bottom block: send button -->
      <div class="w-full flex justify-end">
        <Button
          @click="NextPage"
          :disabled="!isEmailValid || countdown > 0"
          class="w-[300px] p-3 rounded-full flex items-center justify-center transition-all duration-200"
        >
          <div class="inline-flex items-center space-x-2 whitespace-nowrap">
            <ProgressSpinner
              v-if="countdown > 0"
              style="width: 1rem; height: 1rem"
              strokeWidth="4"
            />
            <span class="text-xl font-bold text-black">
              {{ countdown > 0 ? `Resend in ${countdown}s` : "Send Email" }}
            </span>
          </div>
        </Button>
      </div>
    </div>

    <!-- filler so card stays left -->
    <div class="flex-grow"></div>
  </div>
</template>

