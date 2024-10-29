<template>
  <q-layout view="lHh LpR lFf">
    <q-drawer v-model="leftDrawerOpen" side="left" overlay behavior="desktop">
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const leftDrawerOpen = ref(false);
</script>
