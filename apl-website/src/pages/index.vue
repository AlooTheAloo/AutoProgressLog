<script setup lang="ts">
import Integrations from "@/components/index/integrations.vue";
import Features from "../components/index/features.vue";
import Hero from "../components/index/hero.vue";
import GetStarted from "@/components/index/getStarted.vue";
import Footer from "@/components/index/footer.vue";
</script>
<template>
  <div ref="el">
    <Hero />
    <Features />
    <Integrations></Integrations>
    <GetStarted></GetStarted>
    <Footer></Footer>
  </div>
</template>
