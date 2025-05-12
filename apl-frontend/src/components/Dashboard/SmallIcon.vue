<script setup lang="ts">
interface SmallIconProps {
  image: string;
}

defineProps<SmallIconProps>();
</script>

<template>
  <div
    class="select-none1 bg-[#22A7D1] h-[2.5rem] justify-center items-center flex p-4 px-5 rounded-tr-xl rounded-bl-xl"
  >
    <img v-bind:src="image" class="w-4" />
  </div>
</template>
