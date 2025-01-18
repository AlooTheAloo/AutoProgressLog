import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import VueApexCharts from 'vue3-apexcharts';
import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';

const app = createApp(App);

app.use(VueApexCharts);


dayjs.extend(duration);