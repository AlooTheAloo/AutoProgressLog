<!-- src/components/Common/PlexusEffect.vue -->
<template>
  <div class="plexus-container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let particles: Array<{ x: number; y: number; vx: number; vy: number }> = []
let animationId: number
let resizeHandler: () => void

onMounted(() => {
  const c = canvas.value!
  ctx = c.getContext('2d')
  if (!ctx) return

  function resize() {
    c.width = window.innerWidth
    c.height = window.innerHeight
  }
  resize()
  resizeHandler = resize
  window.addEventListener('resize', resize)

  const count = 100
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
  }))

  function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, c.width, c.height)

    for (const p of particles) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fill()
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i]
        const b = particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.hypot(dx, dy)
        if (dist < 100) {
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          const alpha = 1 - dist / 100
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`
          ctx.stroke()
        }
      }
    }

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > c.width) p.vx *= -1
      if (p.y < 0 || p.y > c.height) p.vy *= -1
    }

    animationId = requestAnimationFrame(draw)
  }
  draw()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resizeHandler)
})
</script>

<style scoped>
.plexus-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;            
}
canvas {
  display: block;
}
</style>
