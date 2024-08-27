<script setup lang="ts">
    import Background from '../../assets/Background.png'
</script>
<template>
    <div>
        <div class="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10" :style="{
            backgroundImage: `url(${Background})`
        }" ></div>
    </div>
</template>