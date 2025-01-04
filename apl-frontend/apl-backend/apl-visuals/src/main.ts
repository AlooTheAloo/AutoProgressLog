import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import VueApexCharts from "vue3-apexcharts";
import duration from 'dayjs/plugin/duration'
import dayjs from 'dayjs';

dayjs.extend(duration);


const app = createApp(App);
app.use(VueApexCharts)
app.mount('#app')

