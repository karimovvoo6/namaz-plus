<template>
  <div class="shell" :style="themeStore.backgroundStyle">
    <router-view />
    <OfflineStatus />
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '../stores/themeStore';
import OfflineStatus from './OfflineStatus.vue';
const themeStore = useThemeStore();
</script>

<style scoped>
.shell {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background: #000; /* Fallback */
}
</style>
