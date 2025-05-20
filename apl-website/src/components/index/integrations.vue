<script setup lang="ts">
import { Motion } from "motion-v";
import { useWindowSize } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import AnimatedBeam from "../ui/animated-beam/AnimatedBeam.vue";
import GlowBorder from "../ui/glow-border/GlowBorder.vue";
import AplLogo from "../../assets/Logo.png";
import TogglLogo from "../../assets/Toggl_logo.png";
import AnkiLogo from "../../assets/Anki_logo.png";
import DiscordLogo from "../../assets/discord_logo.webp";

const { width } = useWindowSize();

const backgroundSize = ref(0);
onMounted(() => {
  backgroundSize.value = width.value;
  console.log("Background size: " + backgroundSize.value);
});

const containerRef = ref(null);
const div1Ref = ref(null);
const div2Ref = ref(null);
const div3Ref = ref(null);
const div4Ref = ref(null);

watch(containerRef, () => {
  console.log("Container ref changed" + containerRef.value);
});
</script>
<template>
  <div
    class="flex flex-col relative w-screen overflow-hidden h-[400px] rounded-lg bg-white"
  >
    <div class="w-screen flex justify-center items-center">
      <div class="absolute w-[1000px]">
        <!-- add background pls thanx u-->
      </div>
    </div>

    <Motion
      as="div"
      :initial="{ opacity: 0, y: 40, filter: 'blur(10px)' }"
      :while-in-view="{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }"
      :transition="{
        delay: 0,
        duration: 1,
        ease: 'easeInOut',
      }"
      class="flex flex-col w-full pt-5"
    >
      <div
        class="font-semibold text-2xl mt-5 text-center md:text-4xl text-black"
      >
        Use the tools you

        <div class="text-blue-500 inline text-[1.5rem] text-2xl md:text-4xl">
          already love
        </div>
      </div>
      <div class="font-md text-md text-center md:text-2xl">
        No extra configuration required
      </div>
    </Motion>
    <div class="w-full flex justify-center flex-grow">
      <Motion
        as="div"
        :initial="{ opacity: 0, y: 0, filter: 'blur(10px)' }"
        :while-in-view="{
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
        }"
        :transition="{
          delay: 0,
          duration: 0.8,
          ease: 'easeInOut',
        }"
        class="relative flex items-center justify-center rounded-lg w-50 sm:w-[30rem] max-w-screen"
      >
        <GlowBorder
          :duration="5"
          :border-width="10"
          class="relative rounded-xl flex h-[200px] w-full flex-col items-center justify-center overflow-hidden border md:shadow-xl px-10 shadow-lg shadow-slate-400X"
          :color="['#A07CFE', '#FE8FB5', '#FFBE7B']"
        >
          <div class="w-full h-full absolute p-2">
            <div class="bg-white w-full h-full rounded-md"></div>
          </div>
          <div
            class="flex size-full items-center justify-between z-10"
            ref="containerRef"
          >
            <div class="flex flex-col gap-5">
              <div
                ref="div1Ref"
                class="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
              >
                <img :src="TogglLogo" />
              </div>
              <div
                ref="div2Ref"
                class="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-1.5 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
              >
                <img :src="AnkiLogo" />
              </div>
            </div>
            <div>
              <div
                ref="div3Ref"
                class="z-10 flex size-12 items-center justify-center rounded-lg border-2 bg-white p-1 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
              >
                <img :src="AplLogo" class="w-full h-full" />
              </div>
            </div>
            <div
              ref="div4Ref"
              class="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-1.5 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
            >
              <img :src="DiscordLogo" class="w-full h-full" />
            </div>
          </div>
          <div
            class="absolute inset-0 z-0 flex items-center justify-center left-10 top-3"
            v-if="containerRef && div1Ref && div2Ref && div3Ref && div4Ref"
          >
            <AnimatedBeam
              :container-ref="containerRef"
              :from-ref="div1Ref"
              :to-ref="div3Ref"
              :curvature="10"
              :start-y-offset="0"
              :end-y-offset="0"
              :path-color="'#AAAAAA'"
              :path-opacity="0.5"
              :duration="2"
              :delay="500"
              :gradient-start-color="'#A07CFE'"
              :gradient-stop-color="'#FE8FB5'"
            />
            <AnimatedBeam
              :container-ref="containerRef"
              :from-ref="div2Ref"
              :to-ref="div3Ref"
              :curvature="-10"
              :start-y-offset="0"
              :end-y-offset="0"
              :path-color="'#AAAAAA'"
              :path-opacity="0.5"
              :duration="2"
              :gradient-start-color="'#A07CFE'"
              :gradient-stop-color="'#FE8FB5'"
            />
            <AnimatedBeam
              :container-ref="containerRef"
              :from-ref="div4Ref"
              :to-ref="div3Ref"
              :curvature="0"
              :start-y-offset="0"
              :end-y-offset="0"
              :path-color="'#AAAAAA'"
              :path-opacity="0.5"
              :duration="2"
              :gradient-start-color="'#A07CFE'"
              :gradient-stop-color="'#FE8FB5'"
            />
          </div>
        </GlowBorder>
      </Motion>
    </div>
  </div>
</template>
