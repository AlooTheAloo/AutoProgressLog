<script setup lang="ts">
import {ref} from "vue";
import DarkTheme from "../../../assets/Dark_Theme.png";
import LightTheme from "../../../assets/Light_Theme.png";
import SystemTheme from "../../../assets/System_Theme.png";
import {Theme, colorAccentOptions, AccentColor ,ThemeManager} from "../../../util/theme-manager";

const theme = ref<string>(ThemeManager.getTheme());
const colorAccent = ref<string>(ThemeManager.getAccentColor());

const themes: {
  name: Theme;
  image: string;
}[] = [
  {name: "light", image: LightTheme},
  {name: "dark", image: DarkTheme},
  {name: "system", image: SystemTheme},
];

ThemeManager.onThemeChange((_, newTheme) => {
  theme.value = newTheme;
});

function changeAccentColor(color: AccentColor) {
  ThemeManager.setAccentColor(color);
  colorAccent.value = color;
}
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

  <div class="flex flex-col gap-2 mt-10">
    <h1 class="text-xl font-bold">Accent Color</h1>
    <p class="text-sm">
      Choose your preferred accent color. This will change the color of the
      buttons and other elements.
    </p>
    <div class="flex gap-2">
      <div
          v-for="color in colorAccentOptions"
          @click="changeAccentColor(color)"
          role="button"
          :style="{backgroundColor: color}"
          class="w-10 h-10 border-2 border-black rounded-full"
          :class="color == colorAccent ? 'border-blue-400' : ''"
      />
    </div>
    <p class="text-sm">
      This will change the color of the buttons and other elements.
      <br/>
      <span class="text-red-500">
        Note: This will only work if you are using the light or dark theme.
      </span>
    </p>
  </div>
</template>
