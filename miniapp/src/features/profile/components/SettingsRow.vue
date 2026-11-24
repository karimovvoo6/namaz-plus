<template>
  <button class="row" type="button" @click="$emit('click')">
    <div class="iconWrap">
      <!-- Иконка без JSX: обычный SVG + v-if -->
      <svg v-if="icon === 'user'" class="svg" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
      </svg>

      <svg v-else-if="icon === 'location'" class="svg" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2"/>
      </svg>

      <svg v-else-if="icon === 'globe'" class="svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <path d="M3 12h18" stroke="currentColor" stroke-width="2"/>
        <path d="M12 3c3 3 3 15 0 18" stroke="currentColor" stroke-width="2"/>
        <path d="M12 3c-3 3-3 15 0 18" stroke="currentColor" stroke-width="2"/>
      </svg>

      <svg v-else-if="icon === 'moon'" class="svg" viewBox="0 0 24 24" fill="none">
        <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7.5 7.5 0 1 0 21 14.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>

      <svg v-else-if="icon === 'bell'" class="svg" viewBox="0 0 24 24" fill="none">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>

      <svg v-else-if="icon === 'image'" class="svg" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" stroke-width="2"/>
        <path d="M8 13l2-2 3 3 2-2 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="9" cy="9" r="1.2" fill="currentColor"/>
      </svg>

      <svg v-else-if="icon === 'widgets'" class="svg" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
        <rect x="13" y="4" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
        <rect x="4" y="13" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
        <rect x="13" y="13" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/>
      </svg>

      <svg v-else-if="icon === 'info'" class="svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <path d="M12 10v7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="7" r="1" fill="currentColor"/>
      </svg>

      <svg v-else-if="icon === 'help'" class="svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="17" r="1" fill="currentColor"/>
      </svg>

      <!-- fallback -->
      <svg v-else class="svg" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
      </svg>
    </div>

    <div class="text">
      <div class="line1">
        <div class="title">{{ title }}</div>
        <div v-if="value" class="value">{{ value }}</div>
      </div>

      <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
    </div>

    <div class="chev" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon:
    | 'user'
    | 'location'
    | 'globe'
    | 'moon'
    | 'bell'
    | 'image'
    | 'widgets'
    | 'info'
    | 'help';
  title: string;
  subtitle?: string;
  value?: string;
}>();

defineEmits<{ click: [] }>();
</script>

<style scoped>
.row {
  width: 100%;
  display: grid;
  grid-template-columns: 44px 1fr 26px;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  background: transparent;
  border: 0;
  text-align: left;
  color: rgba(255, 255, 255, 0.92);
  position: relative; /* For pseudo-element */
  transition: background-color 0.2s;
}

.row:active {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Explicit corner clipping */
section:not([class*="dummy"]) > .row:first-child {
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
}
section:not([class*="dummy"]) > .row:last-child {
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
}

/* Remove old full-width border */
.row + .row {
  border-top: none; 
}

/* Add inset border */
.row:not(:first-child)::before {
  content: "";
  position: absolute;
  top: 0;
  left: 66px; /* Icon (44) + Gap (10) + Padding (12) = 66 */
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.08); /* changed from background-color for shorthand safety */
}

.iconWrap {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: rgba(255, 255, 255, 0.92);
}

.svg {
  width: 18px;
  height: 18px;
}

.text {
  min-width: 0;
}

.line1 {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.title {
  font-weight: 800;
  font-size: 15px;
  line-height: 1.2;
  flex-shrink: 0;
}

.value {
  font-weight: 800;
  font-size: 15px;
  opacity: 0.92;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  min-width: 0;
}

.subtitle {
  margin-top: 4px;
  font-size: 12.5px;
  opacity: 0.65;
  line-height: 1.25;
}

.chev {
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.55);
}
</style>
