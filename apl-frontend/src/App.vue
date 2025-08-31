<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterView, useRouter } from "vue-router";
import SideBarContainer from "./components/Common/SideBarContainer.vue";
import GlobalDialogRenderer from "./util/DialogRenderer/GlobalDialogRenderer.vue";
import LoadingScreen from "./components/LoadingScreen.vue";
import { appPath } from "./pages/routes/appRoutes";
import { ThemeManager } from "./util/theme-manager";

const router = useRouter();
const showSideBar = ref(false);

const isLoading = ref(true);
onMounted(() => {
  ThemeManager.init();
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
  if (window.ipcRenderer) {
    window.ipcRenderer.on("is-setup-complete", (_e, ok: boolean) => {
      showSideBar.value = ok;
    });
    window.ipcRenderer.on("set-sidebar-state", (_e, value) => {
      showSideBar.value = value;
      console.log("showSideBar is " + value);
    });
  }
});
</script>

<template>
  <Transition name="fade" mode="out-in" appear>
    <LoadingScreen v-if="isLoading" key="splash" />

    <div v-else key="app">
      <SideBarContainer
        :showSidebar="showSideBar"
        :currentRoute="router.currentRoute.value.path as appPath"
      >
        <RouterView />
      </SideBarContainer>
      <GlobalDialogRenderer />
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
