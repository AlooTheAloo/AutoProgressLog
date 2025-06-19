<script setup lang="ts">
import { useRouter } from "vue-router";
import Button from "primevue/button";
import { motion } from "motion-v";
import { computed, onMounted, ref } from "vue";
import ProgressSpinner from "primevue/progressspinner";
const router = useRouter();
import { InputText } from "primevue";

function NextPage() {
  router.push("/setup/client-server-selection");
}

onMounted(() => {
  window.ipcRenderer.on("open-url", (evt, data: string) => {
    console.log("Data is " + data);
  });
});

const email = ref("");

const isEmailValid = computed(() => {
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  console.log(email.value);
  return re.test(String(email.value).toLowerCase());
});

const emailSent = ref(false);

function SendEmail() {
  emailSent.value = true;
  window.ipcRenderer.invoke(
    "Send-Email",
    email.value,
    window.navigator.userAgent
  );
}
</script>
<template>
  <div
    :style="{
      'background-image': `linear-gradient(to bottom right, #add8e6, #d8b4fe)`,
    }"
    class="flex items-center justify-center w-screen h-screen"
  >
    <motion.div
      :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
      :animate="{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.6 },
      }"
      class="p-4 sm:p-12 flex flex-col justify-between w-full min-h-[30rem] max-w-[40rem] rounded-2xl bg-black"
    >
      <div class="flex flex-col items-start space-y-6 w-full h-full">
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
          <h1
            class="text-3xl w-full text-center font-semibold text-white leading-tight"
          >
            Hey! Let's create your APL account!
          </h1>
          <div
            class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed"
          >
            APL is switching to an account-based model. Please enter your email
            to create one. All your data will be transfered to our new system
            automatically.
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
          class="flex flex-col items-start w-full flex-grow justify-center"
          v-if="emailSent"
        >
          <div
            class="flex flex-col gap-2 items-center justify-center text-xl font-bold w-full"
          >
            <ProgressSpinner />
            Waiting for Confirmation
          </div>
          <p class="text-center w-full">
            An email has been sent to
            <span class="inline text-blue-200"> {{ email }} </span>. Please
            check your inbox for a link to continue.
          </p>
        </motion.div>
      </div>
    </motion.div>
  </div>
</template>
