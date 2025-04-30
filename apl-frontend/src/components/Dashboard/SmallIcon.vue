<script setup lang="ts">
interface SmallIconProps {
  image: string;
}

defineProps<SmallIconProps>();
</script>

<template>
  <div
    class="bg-[#22A7D1] w-[65px] h-[45px] justify-center items-center flex p-5 rounded-tr-xl rounded-bl-xl"
  >
    <img v-bind:src="image" />
  </div>
</template>
