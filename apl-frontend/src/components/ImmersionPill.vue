<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { ThemeManager } from "../util/theme-manager";

interface SocketEvent {
  type: "ActivityStart" | "ActivityStop" | "ClearActivity";
  payload: any;
}

const isVisible = ref(false);
const activityName = ref("");
const startTime = ref<string | null>(null);
const elapsedTime = ref("00:00:00");
const accentColor = ref(ThemeManager.getAccentColor());
const encouragementMessage = ref("");
let timerInterval: NodeJS.Timeout | null = null;
let themeListenerCleanup: (() => void) | null = null;

const messages = [
  "Keep going!",
  "You're doing great!",
  "Stay focused!",
  "You got this!",
  "Nice work!",
  "Keep it up!",
  "Wonderful progress!",
];

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const updateTimer = () => {
  if (startTime.value) {
    const start = new Date(startTime.value).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 1000);
    elapsedTime.value = formatTime(diff);
  }
};

const closePill = () => {
  isVisible.value = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const handleSocketEvent = (_event: any, data: SocketEvent) => {
  console.log("Socket Event Received:", data);
  if (data.type === "ActivityStart") {
    activityName.value = data.payload.activity;
    startTime.value = data.payload.start;
    
    // Pick random message
    encouragementMessage.value = messages[Math.floor(Math.random() * messages.length)];
    
    isVisible.value = true;
    updateTimer();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
  } else if (data.type === "ActivityStop" || data.type === "ClearActivity") {
    isVisible.value = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
};

onMounted(() => {
  if (window.ipcRenderer) {
    console.log("Adding listener for socket-event");
    window.ipcRenderer.on("socket-event", handleSocketEvent);
  }
  
  // Update color when theme changes
  themeListenerCleanup = ThemeManager.onThemeChange(() => {
    accentColor.value = ThemeManager.getAccentColor();
  });
});

onUnmounted(() => {
  console.log("Unmounting Immersion Pill");
  if (window.ipcRenderer) {
    window.ipcRenderer.removeAllListeners("socket-event");
  }
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  if (themeListenerCleanup) {
    themeListenerCleanup();
  }
});
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="isVisible"
      class="immersion-pill-container flex flex-row"
      :style="{ backgroundColor: accentColor }"
    >
      <div class="w-5 flex justify-center items-center">
        <button class="close-btn" @click="closePill">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="flex items-center flex-col flex-grow">
        <div class="pill-content">
          <span class="activity-name max-w-96 text-ellipsis overflow-hidden whitespace-nowrap ">{{ activityName }}</span>
          <span class="separator">|</span>
          <span class="timer">{{ elapsedTime }}</span>
        </div>
        <div class="encouragement-message">
          {{ encouragementMessage }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.immersion-pill-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  display: flex;
  gap: 2px;
  z-index: 9999;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  pointer-events: auto;
  min-width: 200px;
}

.pill-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  width: 100%;
  justify-content: center;
  position: relative;
}


.close-btn:hover {
  opacity: 1;
}



.separator {
  opacity: 0.6;
}

.encouragement-message {
  font-size: 0.75rem;
  opacity: 0.9;
  font-weight: 500;
  margin-top: -2px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translate(-50%, -100%) scale(0.9);
  opacity: 0;
}
</style>
