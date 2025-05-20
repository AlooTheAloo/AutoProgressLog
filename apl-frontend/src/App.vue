<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import SideBarContainer from "./components/Common/SideBarContainer.vue";
import { appPath } from "./pages/routes/appRoutes";
import { onMounted, ref } from "vue";
import { ThemeManager } from "./util/theme-manager";
const router = useRouter();
const showSideBar = ref<boolean>(false);

if (window.ipcRenderer) {
  window.ipcRenderer.invoke("check-for-update");

  window.ipcRenderer.on("router-push", (e, args: string) => {
    router.push(args);
  });

  window.ipcRenderer.on("is-setup-complete", (e, args: boolean) => {
    console.log("showsidebar is " + args);
    showSideBar.value = args;
  });
}

const updateOnlineStatus = () => {
  if (!window.ipcRenderer) return;
  window.ipcRenderer.invoke("SetInternetConnection", navigator.onLine);
};

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

updateOnlineStatus();

ThemeManager.init();
</script>

<template>
  <div class="dark:bg-[#18181880] bg-[#fbfbfb]">
    <SideBarContainer
      :currentRoute="router.currentRoute.value.path as appPath"
      v-if="showSideBar"
    >
      <RouterView />
    </SideBarContainer>
    <RouterView v-else />
  </div>
</template>
