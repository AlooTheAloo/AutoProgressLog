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

const email = ref<string>("");
const password = ref<string>("");

const router = useRouter();
function NextPage() {
  const login: ankiLogin = {
    username: email.value,
    password: password.value,
    url: "https://sync.ankiweb.net",
  };
  console.log(login);
  window.ipcRenderer.invoke("anki-credentials", login);
  router.push("/setup/anki-connect");
}

function SkipAnki() {
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
          <div class="flex flex-col gap-2 items-center w-[30rem] h-52">
            <InputText
              name="username"
              type="text"
              placeholder="Username"
              v-model="email"
            />
            <Password
              v-model="password"
              name="pw"
              type="text"
              placeholder="Password"
              :feedback="false"
            />
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
