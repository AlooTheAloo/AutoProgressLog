import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Index from "./pages/index.vue";
import Downloads from "./pages/downloads.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: Index },
  { path: "/downloads", component: Downloads },
];

const router = createRouter({
  routes: routes,
  history: createWebHistory(),
});

createApp(App).use(router).mount("#app");
