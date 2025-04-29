<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import AccountDisplay from "../../../components/Common/AccountDisplay.vue";
import BackButton from "../../../components/Common/BackButton.vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { ankiLogin } from "../../../../apl-backend/config/configAnkiIntegration";
import { onMounted, ref, useModel } from "vue";
import AccordionPanel from "primevue/accordionpanel";
import Accordion from "primevue/accordion";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import Logo from "../../../assets/Logo.png";
import { motion } from "motion-v";

const DEFAULT_URL = "https://sync.ankiweb.net";

const email = ref<string>("");
const password = ref<string>("");
const url = ref<string>(DEFAULT_URL);

const router = useRouter();
function NextPage() {
  const login: ankiLogin = {
    username: email.value,
    password: password.value,
    url: url.value,
  };
  console.log(login);
  window.ipcRenderer.invoke("anki-credentials", login);
  router.push("/setup/anki-connect");
}

function SkipAnki() {
  window.ipcRenderer.invoke("SkipAnki");
  router.push("/setup/pick-filename");
}

onMounted(() => {
  window.ipcRenderer
    .invoke("get-anki-credentials")
    .then((credentials: ankiLogin) => {
      if (credentials.username && credentials.password) {
        email.value = credentials.username;
        password.value = credentials.password;
        url.value = credentials.url;
      }
    });
});
</script>

<template>
  <SetupBackground />

  <div class="flex w-screen">
    <div
      class="p-4 sm:p-12 flex flex-col justify-between w-full max-w-[60rem] bg-black min-h-screen"
    >
      <div class="space-y-6 w-full">
        <div class="flex w-full items-center justify-between">
          <img :src="Logo" alt="APL Logo" class="w-16 h-16 sm:w-20 sm:h-20" />
          <AccountDisplay />
        </div>

        <motion.div
          :initial="{ opacity: 0, y: 20, filter: 'blur(10px)' }"
          :animate="{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.6 },
          }"
          class="flex flex-col items-start space-y-6 w-full"
        >
          <BackButton route="/setup/toggl-success" />

          <h1
            class="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-tight"
          >
            Time to connect to Anki.
          </h1>

          <div
            class="text-xs sm:text-sm lg:text-base text-[#C0C0C0] leading-relaxed"
          >
            Support for other Spaced Repetition Software (SRS) will be added in
            the future.
          </div>
          <div class="flex flex-col gap-6 w-full">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <div class="text-lg text-white sm:w-1/3">
                AnkiWeb username (usually your email)
              </div>
              <InputText
                v-model="email"
                placeholder="Username"
                fluid
                class="w-full sm:flex-1"
              />
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <div class="text-lg text-white sm:w-1/3">AnkiWeb password</div>
              <Password
                v-model="password"
                placeholder="Password"
                fluid
                :feedback="false"
                class="w-full sm:flex-1"
              />
            </div>

            <Accordion value="-1" class="w-full">
              <AccordionPanel value="0">
                <AccordionHeader>Advanced Settings</AccordionHeader>
                <AccordionContent>
                  <div
                    class="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-5 w-full"
                  >
                    <label
                      for="anki-url"
                      class="font-semibold w-full sm:w-auto"
                    >
                      Anki Sync URL
                    </label>
                    <InputText
                      id="anki-url"
                      v-model="url"
                      autocomplete="off"
                      class="flex-1"
                    />
                  </div>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </motion.div>
      </div>

      <div class="flex justify-between w-full">
        <Button
          label="I don’t use Anki"
          link
          style="font-size: 12px; padding: 0"
          @click="SkipAnki"
        />
        <Button @click="NextPage" class="w-[300px] p-3 !rounded-full">
          <span class="text-xl font-bold text-black">Continue</span>
        </Button>
      </div>
    </div>

    <div class="flex-grow"></div>
  </div>
</template>

<style scoped>
.p-accordionheader,
.p-accordioncontent-content {
  background-color: background !important;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.p-accordionpanel {
  border: 0 !important;
}
</style>
