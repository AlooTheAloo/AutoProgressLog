<script setup lang="ts">
import { ref } from "vue";
import DarkTheme from "../../../assets/Dark_Theme.png";
import LightTheme from "../../../assets/Light_Theme.png";
import SystemTheme from "../../../assets/System_Theme.png";
import { Theme, ThemeManager } from "../../../util/theme-manager";

const theme = ref<string>(ThemeManager.getTheme());

const themes: {
  name: Theme;
  image: string;
}[] = [
  { name: "light", image: LightTheme },
  { name: "dark", image: DarkTheme },
  { name: "system", image: SystemTheme },
];

ThemeManager.onThemeChange((_, newTheme) => {
  theme.value = newTheme;
});
</script>

<template>
  <div class="flex flex-col w-full gap-2">
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-2">
        <h1 class="text-xl font-bold">Theme</h1>
        <div class="flex flex-col gap-2">
          <p class="text-sm">
            Choose your preferred theme. You can choose between light, dark and
            system themes.
          </p>
          <div class="flex gap-2">
            <img
              v-for="t in themes"
              @click="ThemeManager.setTheme(t.name)"
              role="button"
              :src="t.image"
              class="w-36 border-2 border-black rounded-xl"
              :class="t.name == theme ? 'border-blue-400' : ''"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
