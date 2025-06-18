<script setup lang="ts">
import { useRouter } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import Button from "primevue/button";
import Logo from "../../../assets/Logo.png";
import { AnimatePresence, motion } from "motion-v";
import { computed, onMounted, ref } from "vue";
import { ThemeManager } from "../../../util/theme-manager";
import { Form } from "@primevue/forms";
import ProgressSpinner from "primevue/progressspinner"
const router = useRouter();
function NextPage() {
  router.push("/setup/client-server-selection");
}
const { height } = useWindowSize();

onMounted(() => {
  ThemeManager.setTheme("dark");
});

const email = ref("");

import { reactive } from "vue";
import { useToast } from "primevue/usetoast";
import { InputText } from "primevue";
import BackButton from "../../../components/Common/BackButton.vue";

const toast = useToast();

const initialValues = reactive({
  username: "",
});

const resolver = ({ values }: { values: { username: string } }) => {
  const errors: any = {};

  if (!values.username) {
    errors.username = [{ message: "Username is required." }];
  }

  return {
    values, // (Optional) Used to pass current form values to submit event.
    errors,
  };
};

const isEmailValid = computed(() => {
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  console.log(email.value);
  return re.test(String(email.value).toLowerCase());
});

const emailSent = ref(false);

function SendEmail() {
  emailSent.value = true;
  // TODO: Send email
}
</script>
<template>
  <SetupBackground />
  <div class="flex w-screen">
    <div
      class="p-4 sm:p-12 flex flex-col justify-between w-full max-w-[60rem] bg-black min-h-screen"
    >
      <div class="flex flex-col items-start space-y-6 w-full h-full  ">
        <img
          :src="Logo"
          alt="APL Logo"
          class="w-16 h-16 sm:w-20 sm:h-20 block"
        />
        <motion.div
          :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
          :animate="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.6 },
          }"
          class="flex flex-col items-start space-y-6"
        >
          <BackButton route="/setup/index" />
          <h1
            class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight"
          >
            Let's start with your email.
          </h1>
          <div
            class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed"
          >
            Please enter an email address you have access to. We will send you a
            link to create an account or login.
          </div>

          <div class="w-full flex gap-2">
            <InputText
              fluid
              placeholder="john.doe@example.com"
              v-model="email"
            />
            <Button
              @click="SendEmail"
              class="w-[200px] p-3 !rounded-full transition-all"
              :disabled="!isEmailValid"
            >
              <span class="text-md font-semibold text-black">Send Email</span>
            </Button>
          </div>
        </motion.div>

        <motion.div
          :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
          :animate="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.6 },
          }"
          class="flex flex-col items-start w-full flex-grow justify-center "
          v-if="emailSent"
        >
            <div
                class="flex flex-col gap-2 items-center justify-center text-xl font-bold w-full">
                <ProgressSpinner />
                Waiting for Confirmation 
            </div>
            <p class="text-center w-full ">
                An email has been sent to <p class="inline text-blue-200">
                    {{ email }}
                </p>. Please check your inbox for a link to continue.
            </p>

        </motion.div>

      </div>
    </div>
    <div class="flex-grow"></div>
  </div>
</template>
