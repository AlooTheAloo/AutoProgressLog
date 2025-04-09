<script setup lang="ts">
import { Motion } from "motion-v";
import FlickeringGrid from "../ui/flickering-grid/FlickeringGrid.vue";
import { useWindowSize } from "@vueuse/core";
import { Github, HardDrive } from "lucide-vue-next";
import { onMounted, ref, watch } from "vue";
import AnimatedBeam from "../ui/animated-beam/AnimatedBeam.vue";
import GlowBorder from "../ui/glow-border/GlowBorder.vue";

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
    class="flex flex-col relative w-screen overflow-hidden h-[400px] rounded-lg border bg-black"
  >
    <div class="w-screen flex justify-center items-center">
      <div class="absolute w-[500px]]">
        <FlickeringGrid
          class="h-[400px] inset-0 z-0 [mask-image:radial-gradient(750px_circle_at_center,white,transparent)]"
          :square-size="4"
          :grid-gap="6"
          color="#60A5FA"
          :max-opacity="0.5"
          :flicker-chance="0.05"
          :height="800"
          :width="500"
        />
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
        duration: 0.8,
        ease: 'easeInOut',
      }"
      class="flex flex-col w-full pt-5 text-white"
    >
      <div
        class="font-semibold text-2xl text-center md:text-4xl dark:text-white"
      >
        Use the tools you already love
      </div>
      <div class="font-md text-md text-center md:text-2xl dark:text-white">
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
        class="relative flex items-center justify-center overflow-hidden rounded-lg w-50 sm:w-[30rem] max-w-screen"
      >
        <GlowBorder
          :border-width="10"
          class="relative flex h-[200px] w-full flex-col items-center justify-center overflow-hidden border md:shadow-xl px-10"
          :color="['#A07CFE', '#FE8FB5', '#FFBE7B']"
        >
          <div
            class="flex size-full items-center justify-between z-10"
            ref="containerRef"
          >
            <div class="flex flex-col gap-5">
              <div
                ref="div1Ref"
                class="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
              >
                <Github />
              </div>
              <div
                ref="div2Ref"
                class="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
              >
                <HardDrive />
              </div>
            </div>
            <div>
              <div
                ref="div3Ref"
                class="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
              >
                <HardDrive />
              </div>
            </div>
            <div
              ref="div4Ref"
              class="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
            >
              <Github />
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
