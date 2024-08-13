import { createApp } from 'vue'
import App from './App.vue'
import { createMemoryHistory, createRouter, RouteRecordRaw } from 'vue-router'
import SetupIndex from './pages/Setup/SetupIndex.vue'
import SetupClientServerSelection from './pages/Setup/Setup-client-server-selection.vue'
import page2 from './pages/page2.vue'
import './style.css'
import './demos/ipc'
import PageSelector from './pages/PageSelector.vue'


const routes:RouteRecordRaw[] = [
  { path: '/', component: PageSelector },
  { path: '/setup/index', component: SetupIndex },
  { path: '/setup/client-server-selection', component: SetupClientServerSelection  },
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
