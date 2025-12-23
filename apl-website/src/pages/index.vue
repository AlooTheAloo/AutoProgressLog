<script setup lang="ts">
import Integrations from "@/components/index/integrations.vue";
import Features from "../components/index/features.vue";
import Hero from "../components/index/hero.vue";
import GetStarted from "@/components/index/getStarted.vue";
import Footer from "@/components/index/footer.vue";
import Showcase from "../components/index/Showcase.vue";
import FAQ from "../components/index/FAQ.vue";
</script>
<template>
  <div ref="el" class="overflow-x-hidden">
    <Hero />
    <Showcase />
    <Features />
    <Integrations></Integrations>
    <FAQ />
    <GetStarted></GetStarted>
    <Footer></Footer>
  </div>
</template>
