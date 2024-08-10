import { createApp } from 'vue'
import App from './App.vue'
import { createMemoryHistory, createRouter, RouteRecordRaw } from 'vue-router'
import page1 from './pages/page1.vue'
import page2 from './pages/page2.vue'
import './style.css'
import './demos/ipc'
import PageSelector from './pages/PageSelector.vue'


const routes:RouteRecordRaw[] = [
  { path: '/', component: PageSelector },
  { path: '/page1', component: page1 },
  { path: '/page2', component: page2 },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes: routes,
})

createApp(App)
  .use(router)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
