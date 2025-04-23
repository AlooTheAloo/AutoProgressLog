import { createApp } from "vue";
import App from "./App.vue";
import { createMemoryHistory, createRouter, RouteRecordRaw } from "vue-router";
import "./style.css";
import PageSelector from "./pages/PageSelector.vue";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import { definePreset } from "@primevue/themes";
import Ripple from "primevue/ripple";
import routes from "./pages/routes/routes";
import "primeicons/primeicons.css";
import Tooltip from "primevue/tooltip";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import VueWriter from "vue-writer";
import VueApexCharts from "vue3-apexcharts";

const router = createRouter({
  history: createMemoryHistory(),
  routes: routes,
});

const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{zinc.50}",
      100: "{zinc.100}",
      200: "{zinc.200}",
      300: "{zinc.300}",
      400: "{zinc.400}",
      500: "{zinc.500}",
      600: "{zinc.600}",
      700: "{zinc.700}",
      800: "{zinc.800}",
      900: "{zinc.900}",
      950: "{zinc.950}",
    },
    colorScheme: {
      light: {
        primary: {
          color: "{zinc.950}",
          inverseColor: "#ffffff",
          hoverColor: "{zinc.900}",
          activeColor: "{zinc.800}",
        },
        highlight: {
          background: "{zinc.950}",
          focusBackground: "{zinc.700}",
          color: "#ffffff",
          focusColor: "#ffffff",
        },
      },
      dark: {
        primary: {
          color: "{zinc.50}",
          inverseColor: "{zinc.950}",
          hoverColor: "{zinc.100}",
          activeColor: "{zinc.200}",
        },
        highlight: {
          background: "rgba(250, 250, 250, .16)",
          focusBackground: "rgba(250, 250, 250, .24)",
          color: "rgba(255,255,255,.87)",
          focusColor: "rgba(255,255,255,.87)",
        },
      },
    },
  },
});

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

createApp(App)
  .use(ConfirmationService)
  .use(ToastService)
  .use(router)
  .use(VueWriter as any)
  .use(PrimeVue, {
    theme: {
      preset: Noir,
      options: {
        darkModeSelector: ".my-app-dark",
      },
    },
    ripple: true,
  })
  .use(VueApexCharts)
  .directive("ripple", Ripple)
  .directive("tooltip", Tooltip)
  .mount("#app")
  .$nextTick(() => {
    postMessage({ payload: "removeLoading" }, "*");
  });

