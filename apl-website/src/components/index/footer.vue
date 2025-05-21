<template>
  <footer class="bg-black text-white py-4">
    <div class="max-w-screen-xl mx-auto flex items-center justify-between px-4">
      <!-- Left side: logo + app name -->
      <div class="flex items-center space-x-3">
        <img src="@/assets/Logo.png" alt="APL Logo" class="w-8 h-8" />
        <span class="font-semibold text-lg">AutoProgressLog.</span>
      </div>

      <!-- Right side: nav links + icons -->
      <nav class="flex items-center sm:space-x-8 space-x-4">
        <a
          href="https://github.com/AlooTheAloo/AutoProgressLog"
          target="_blank"
          class="hover:text-[#0FB4EC]"
        >
          Github
        </a>
        <RouterLink to="/downloads" class="hover:text-[#0FB4EC]">
          Download
        </RouterLink>

        <!-- social / code icons -->
        <a
          href="https://github.com/AlooTheAloo/AutoProgressLog"
          target="_blank"
          class="hover:text-[#0FB4EC]"
        >
          <i class="pi pi-github text-xl"></i>
        </a>
        <a
          href="https://discord.gg/RFfVaKbyqd"
          target="_blank"
          class="hover:text-[#0FB4EC]"
        >
          <i class="pi pi-discord text-xl"></i>
        </a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
