<script setup lang="ts">
    import { useRoute, useRouter } from 'vue-router';
    import SetupBackground from '../../components/Setup/SetupBackground.vue';
    import Card from 'primevue/card';
    import Server from "../../assets/Server.png";
    import Client from "../../assets/Client.png";
    import { useWindowSize } from '@vueuse/core'
    import Logo from '../../assets/Logo.png'
    const router = useRouter()
    function SelectClient(){
        router.push('/setup/Toggl-home');
    }

    function SelectServer(){    
        
    }

    const { width, height } = useWindowSize()
</script>

<template>

        <SetupBackground/>

        <div class=" flex w-screen">
            <div class=" p-12 flex flex-col w-2/3  bg-black h-screen">
                <div class="absolute" v-if="height > 650">
                    <img :src="Logo" class=" w-12 h-12">
                </div>
                <div class="flex flex-col flex-grow  justify-center gap-2 text-left ">
                    <div class="font-semibold text-4xl">
                        What will this device be?
                    </div>
                    <div class="text-gray-600 font-light mb-5 text-xs lg:text-sm">
                        AutoProgressLog works on servers and home computers. If you are running this on your own computer, the client mode is strongly recommended. Select the server mode only if you know that your computer will always be turned on and connected to the internet.
                    </div>
                    <div class="flex gap-12 select-none ">
                        <div v-ripple class="bg-[#18181B] rounded-xl w-72 aspect-square flex-shrin cursor-pointer" @click="SelectClient">
                            <div class=" absolute bg-[#0FB4EC] w-fit h-6 flex items-center px-2 text-xs
                                rounded-br-xl">
                                Recommended
                            </div>
                            <div class="w-full h-full flex flex-col justify-center items-center">
                                <div class="flex w-full justify-center items-center">
                                    <img :src="Client" class="w-1/4 aspect-square">
                                </div>
                                <div class=" mt-1 text-center text-2xl font-bold">
                                    Client
                                </div>
                                <div class=" font-semibold text-xs px-5 lg:text-[15px] lg:leading-5 text-center w-full">
                                    Reports will have to be manually 
                                    generated
                                </div>
                            </div>
                        </div>
                        <div v-ripple class="bg-[#18181B] rounded-xl w-72 aspect-square flex-shrin cursor-pointer" @click="SelectServer">
                            
                            <div class="w-full h-full flex flex-col justify-center items-center">
                                <div class="flex w-full justify-center items-center">
                                    <img :src="Server" class="w-1/4 aspect-square">
                                </div>
                                <div class="font-bold mt-1 text-center text-2xl">
                                    Server
                                </div>
                                <div class=" font-semibold text-xs px-5 lg:text-[15px] lg:leading-5 text-center w-full">
                                    Reports will be generated automatically at a specific time interval
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        
</template>