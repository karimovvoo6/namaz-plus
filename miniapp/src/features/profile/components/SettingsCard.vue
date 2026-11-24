<template>
  <section class="card">
    <slot />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.card {
  border-radius: 18px;
  overflow: hidden;
  background: rgba(20, 30, 35, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}
</style>
