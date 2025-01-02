<template>
  <div class="q-pa-md">
    <q-layout view="lHh LpR lFf">
      <q-drawer
        v-model="leftDrawerOpen"
        :mini="miniState"
        @mouseenter="miniState = false"
        @mouseleave="miniState = true"
        show-if-above
      >
        <div class="drawer-container">
          <!-- Top Item -->
          <div class="drawer-top">
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-icon :name="`img:${APLIcon}`" size="md" />
              </q-item-section>

              <q-item-section>AutoProgressLog</q-item-section>
            </q-item>
          </div>

          <!-- Middle Items (Scrollable Area) -->
          <div class="drawer-scroll">
            <q-list padding class="menu-list">
              <q-item clickable v-ripple :to="{ name: 'index' }">
                <q-item-section avatar>
                  <q-icon name="play_circle" />
                </q-item-section>

                <q-item-section>{{ t('layout.getStarted') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple :to="{ name: 'download' }">
                <q-item-section avatar>
                  <q-icon name="download" />
                </q-item-section>

                <q-item-section>{{ t('layout.download') }}</q-item-section>
              </q-item>

              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="language" />
                </q-item-section>

                <q-item-section>{{ t('layout.wiki') }}</q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="drawer-bottom">
            <q-list padding>
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="discord" />
                </q-item-section>

                <q-item-section>Discord</q-item-section>
              </q-item>

              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>

                <q-item-section>Github</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-drawer>

      <q-page-container>
        <q-page padding>
          <router-view />
        </q-page>
      </q-page-container>
      <q-footer reveal class="bg-grey-10 text-white">
        <q-toolbar class="flex justify-between items-center">
          <!-- Logo and Title -->
          <q-toolbar-title class="flex items-center gap-lg">
            <q-icon :name="`img:${APLIcon}`" size="lg" />
            <div>AutoProgressLog<span class="text-blue">.</span></div>
          </q-toolbar-title>

          <!-- Locale Selector -->
          <q-select
            v-model="locale"
            :options="locale_options"
            emit-value
            map-options
            dense
            borderless
            class="locale-selector"
          />

          <!-- Navigation Links -->
          <q-list class="q-pa-md flex items-center gap-md">
            <q-item clickable v-ripple :to="{ name: 'index' }">
              <q-item-section>{{ t('layout.getStarted') }}</q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'download' }">
              <q-item-section>{{ t('layout.download') }}</q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'wiki' }">
              <q-item-section>{{ t('layout.wiki') }}</q-item-section>
            </q-item>
          </q-list>

          <!-- Icon Buttons -->
          <div class="icon-buttons flex gap-sm">
            <q-btn icon="discord" flat aria-label="Discord" />
            <q-btn icon="settings" flat aria-label="Settings" />
          </div>
        </q-toolbar>
      </q-footer>
    </q-layout>
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
