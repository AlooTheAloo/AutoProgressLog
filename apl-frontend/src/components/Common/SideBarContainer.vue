
<script setup lang="ts">
    import { useRoute, useRouter } from "vue-router";
    import Logo from "../../assets/Logo.png"
    import { appPath as AppPath, appRoutes } from "../../pages/routes/appRoutes";
    import { onMounted } from "vue";

    import Overview from "../../assets/Icons/Sidebar/Overview.svg"
    import Reports from "../../assets/Icons/Sidebar/Reports.svg"
    import Achievements from "../../assets/Icons/Sidebar/Achievements.svg"
    import Statistics from "../../assets/Icons/Sidebar/Statistics.svg"
    
    import Settings from '../../assets/Icons/Sidebar/Settings.svg'
    import Help from '../../assets/Icons/Sidebar/Help.svg'
    
    const HELP_PAGE_URL = "https://www.aplapp.dev/#/"
    const router = useRouter();

    interface route {
        path?: AppPath;
        image: string;
        name: string;
    }

    const routes:route[] = [
        {
            path: "/app/dashboard",
            image: Overview,
            name: "Overview",
        },
        {
            path: "/app/reports",
            image: Reports,
            name: "Reports",
        },
        {
            image: Achievements,
            name: "Achievements",
        },
        {
            image: Statistics,
            name: "Statistics",
        }
    ]

    const handleClick = (path: string | undefined) => {
        if (!path) return;
        if(path == router.currentRoute.value.path) return;
        console.log("moving to " + path);
        router.push(path);
    };

    const openHelpCenter = () => {
        window.ipcRenderer.invoke("OpenExternal", HELP_PAGE_URL);
    }

    const props = defineProps<{
        currentRoute: AppPath;
    }>();


    onMounted(() => {
        console.log(props.currentRoute);
    })

</script>

<template>

    <div class="h-screen w-screen absolute overflow-hidden pointer-events-none">
        
        <div class="flex absolute w-full h-full  items-end justify-end">
            <div
            style="filter: blur(75px);"
            class="glow glow-delay w-96 h-96 absolute rounded-full bg-[#24CAFF] z-0 -mr-64 -mb-64 ">
    
            </div>
        </div>



        <div class="w-24 xl:w-72 transition-all duration-250 h-full overflow-hidden">
            <div
            style="filter: blur(75px);"
            class="glow w-96 h-96 rounded-full bg-[#24CAFF] z-0 -ml-64 -mt-64 ">
    
            </div>

        </div>
    </div>

    <div class="flex w-screen h-screen">
        <div class="flex flex-col bg-[#1B1B1B] p-3 w-24 xl:w-72 items-center xl:items-start transition-all duration-250"> <!-- Sidebar here -->
            <!-- Logo  -->
            <div class=" w-full z-10"> 
                <img :src="Logo" class="w-[4.5rem]"/>
            </div>
                <!-- Navigation  -->
            <div
            
            class="flex flex-col gap-4 w-full mt-20 flex-grow cursor-pointer">
                <div v-for="route in routes"
                :style="{
                    cursor: route.path != null ? 'pointer' : 'default',
                    opacity: route.path == null ? 0.5 : 1,
                    backgroundColor: route.path == props.currentRoute ? '#24CAFF' : '',
                }"
                
                :key="route.path" class="xl:justify-start justify-center rounded-lg p-2 flex items-center gap-2 w-full h-12"
                    v-on:click="(e) => handleClick(route.path)" @click.stop
                >
                    <img :src="route.image" class="w-6 h-6"/>
                    <div class="font-semibold text-white xl:block hidden">
                        {{ route.name 
                        }}
                    </div>
                </div>
            </div>
            <!-- Settings and help  -->
            <div class="flex flex-col gap-4 w-full justify-end  flex-grow">
                <router-link to="/app/settings" class="flex items-center gap-2 w-full">
                    <img :src="Settings" class="w-6 h-6"/>
                    <div class="font-semibold text-white xl:block hidden">
                        Settings
                    </div>
                </router-link>
                <button :onclick="openHelpCenter" class="flex items-center gap-2 w-full">
                    <img :src="Help" class="w-6 h-6"/>
                    <div class="font-semibold text-white xl:block hidden ">
                        Help center
                    </div>
                </button>
            </div>
        </div>
        <div class="flex-grow"> <!-- App here -->
            <slot />
        </div>
    </div>
</template>

<style scoped>
    .glow {
        pointer-events: none;
        animation-name: breathe;
        animation-duration: 10s;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        animation-timing-function: ease-in-out;
    }

    .glow-delay {
        animation-delay: -2s;
    }

    /* The animation code */
    @keyframes breathe {
        from { width: 24rem; height: 24rem;}
        to { width: 18rem; height: 18rem;}
    }
</style>