<template>
  <div class="bot-container" style="padding-bottom: 1rem;">
    If you're interested in getting beta access and help testing the app, shoot me a DM on discord (AlooTheAloo4250)

  </div>
  <div class="app-container">
    <img :src="APLIcon" style="width: 5rem; height: 5rem; margin-bottom: 1rem;" />
    <div style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
      <div style="font-size: 3rem; padding: 0.5rem;" class="text-gradient">
        Hey there ! 
      </div>
      
      <div style="font-size: 1.5rem; text-align: center; padding: 0.5rem;">
        If you're here, you're probably looking for how to make those immersion reports.
        <br>
        The app used to create them is still in active development, but we're getting closer to launch! Stay tuned for updates! 🚀
        <br>
      </div>
    </div>
    
  </div>


</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import APLIcon from 'assets/APLIcon.png';
import locale_options from 'src/i18n/locale_options';
const leftDrawerOpen = ref(true);
const miniState = ref(true);
const { t, locale } = useI18n();
</script>

<style lang="scss" scoped>

.text-gradient {
  background: linear-gradient(to right, #89BDFF, #40FFFF);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;
  background-color: #242424;
  color: white;
}

.bot-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: end;
  color: white;
}


.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-top {
  padding: 1rem; // Top padding for the first section
}

.drawer-scroll {
  flex: 1; // Occupies the remaining vertical space
  max-height: calc(100% - 150px); // Adjust for the fixed top and bottom areas
  overflow-y: auto; // Ensure scrollability
  padding: 1rem;
}

.drawer-bottom {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem; // Space between buttons
}
</style>
