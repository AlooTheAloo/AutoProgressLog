<template>
    <footer class="bg-black text-white py-4">
      <div class="max-w-screen-xl mx-auto flex items-center justify-between px-4">
        <div class="flex items-center space-x-3">
          <img src="@/assets/Logo.png" alt="APL Logo" class="w-8 h-8"/>
          <span class="font-semibold text-lg">AutoProgressLog.</span>
        </div>
  
        <nav class="flex items-center space-x-8">
          <RouterLink to="/get-started" class="hover:text-[#0FB4EC]">
            Get started
          </RouterLink>
          <RouterLink to="/downloads" class="hover:text-[#0FB4EC]">
            Download
          </RouterLink>

          <a href="https://github.com/AlooTheAloo/AutoProgressLog" target="_blank" class="hover:text-[#0FB4EC]">
            <img src="@/assets/icons8-github.svg" class="w-6 h-6" alt="My Icon" />
          </a>
          <a href="https://discord.gg/RFfVaKbyqd" target="_blank" class="hover:text-[#0FB4EC]">
            <img src="@/assets/icons8-discord.svg" class="w-6 h-6" alt="My Icon" />
          </a>
        </nav>
      </div>
    </footer>
  </template>
  
  <script setup lang="ts">
  import { RouterLink } from 'vue-router';
  </script>
  
  <style scoped>
  </style>
