<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import SetupBackground from "../../../components/Setup/SetupBackground.vue";
import AccountDisplay from "../../../components/Common/AccountDisplay.vue";
import BackButton from "../../../components/Common/BackButton.vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { ankiLogin } from "../../../../apl-backend/config/configAnkiIntegration";
import { ref, useModel } from "vue";
import AccordionPanel from "primevue/accordionpanel";
import Accordion from "primevue/accordion";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";

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
</script>

<template>
  <SetupBackground></SetupBackground>

  <div class="flex w-screen">
    <div class="p-12 flex flex-col w-2/3 bg-black h-screen">
      <AccountDisplay />
      <div class="flex flex-col flex-grow py-5 justify-start gap-2 text-left">
        <BackButton route="/setup/toggl-success" />
        <div class="font-semibold text-white text-4xl">
          Time to connect to Anki.
        </div>
        <p class="text-sm">
          Support for other Spaced Repetition Software (SRS) will be added in
          the future.
        </p>
        <div class="flex justify-center flex-grow items-center">
          <div class="flex flex-col gap-2 items-start w-full">
            <div class="flex w-full h-12 items-center">
              <div class="text-lg text-white w-[25rem]">
                AnkiWeb username (usually your email)
              </div>
              <div class="flex-grow">
                <InputText v-model="email" placeholder="Username" fluid />
              </div>
            </div>
            <div class="flex w-full h-12 items-center">
              <div class="text-lg text-white w-[25rem]">AnkiWeb password</div>
              <div class="flex-grow">
                <Password
                  v-model="password"
                  placeholder="Password"
                  fluid
                  :feedback="false"
                />
              </div>
            </div>
            <Accordion value="-1" class="w-full">
              <AccordionPanel value="0" class="">
                <AccordionHeader class="">Advanced Settings</AccordionHeader>
                <AccordionContent class="">
                  <div class="flex items-center gap-4 pt-5">
                    <label for="email" class="font-semibold w-fit"
                      >Anki Sync URL</label
                    >
                    <InputText
                      class="flex-auto"
                      autocomplete="off"
                      v-model="url"
                    />
                  </div>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </div>
        <div class="flex justify-between">
          <Button
            label="I don't use anki"
            style="font-size: 12px; padding: 0px"
            link
            @click="SkipAnki"
          />

          <Button @click="NextPage" style="width: 120px" label="Continue" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
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
