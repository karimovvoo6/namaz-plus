<template>
  <div class="qibla-view">
    <div class="bg" />
    
    <div class="content">
      <!-- TopBar -->
      <div class="top-bar">
        <button class="back-btn" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="title">{{ $t('qibla.title') }}</div>
        <div style="width: 40px" />
      </div>

      <!-- Compass -->
      <div class="compass-container">
        <div class="compass" :style="{ transform: `rotate(${-heading}deg)` }">
          <div class="compass-ring">
            <div class="compass-mark" v-for="i in 36" :key="i" :style="{ transform: `rotate(${i * 10}deg)` }">
              <div v-if="i % 3 === 0" class="compass-mark-major" />
              <div v-else class="compass-mark-minor" />
            </div>
          </div>
          
          <!-- Qibla Arrow -->
          <div class="qibla-arrow" :style="{ transform: `translate(-50%, -50%) rotate(${qiblaDirection}deg)` }">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <!-- Clear navigation arrow, pointing towards top (12 2) -->
              <path
                d="M12 2L4 20l8-5 8 5L12 2z"
                fill="rgba(255, 200, 0, 0.9)"
                stroke="rgba(255, 255, 255, 0.2)"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <!-- Center dot -->
          <div class="compass-center" />
        </div>

        <!-- Direction info -->
        <div class="direction-info">
          <div class="direction-value">{{ Math.round(heading) }}°</div>
          <div class="direction-label">{{ $t('qibla.direction') }}</div>
        </div>
      </div>

      <!-- Calibration message -->
      <div v-if="needsCalibration" class="calibration-message">
        <div class="calibration-text">{{ $t('qibla.calibrate') }}</div>
        <div class="calibration-hint">{{ $t('qibla.calibrationHint') }}</div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocationStore } from '../../stores/locationStore';


const router = useRouter();
const { t } = useI18n();
const locationStore = useLocationStore();
// const themeStore = useThemeStore();



// Координаты Каабы
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const heading = ref(0); // Направление устройства (0 = север)
const qiblaDirection = ref(0); // Направление на Киблу относительно севера (0-360)
const needsCalibration = ref(false);
const error = ref<string | null>(null);

let orientationHandler: ((event: any) => void) | null = null;

// Вычисление направления на Киблу (bearing)
function calculateQiblaDirection(lat: number, lng: number): number {
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = (KAABA_LAT * Math.PI) / 180;
  const lng2 = (KAABA_LNG * Math.PI) / 180;

  const dLng = lng2 - lng1;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  return bearing;
}

// Обновление направления на Киблу
function updateQiblaDirection() {
  if (locationStore.currentLocation) {
    const direction = calculateQiblaDirection(
      locationStore.currentLocation.latitude,
      locationStore.currentLocation.longitude
    );
    qiblaDirection.value = direction;
  } else {
    error.value = t('location.error');
  }
}

// Обработка ориентации устройства
function handleOrientation(event: any) {
  let h = null;
  if (event.webkitCompassHeading !== undefined) {
    // iOS Safari
    h = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    // Other browsers (Android)
    h = 360 - event.alpha;
  }

  if (h !== null && !isNaN(h)) {
    heading.value = h;
    needsCalibration.value = false;
  }
}

function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined') {
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      // iOS 13+
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            startCompass();
          } else {
            error.value = t('qibla.errorPermission');
          }
        })
        .catch(() => {
          error.value = t('qibla.errorRequest');
        });
    } else {
      // Android и другие
      startCompass();
    }
  } else {
    error.value = t('qibla.notSupported');
  }
}

function startCompass() {
  orientationHandler = handleOrientation;
  if ('ondeviceorientationabsolute' in window) {
    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener);
  } else {
    window.addEventListener('deviceorientation', handleOrientation as EventListener);
  }
  needsCalibration.value = true;
  
  // Убираем сообщение о калибровке через 3 секунды
  setTimeout(() => {
    needsCalibration.value = false;
  }, 3000);
}

function stopCompass() {
  if (orientationHandler) {
    if ('ondeviceorientationabsolute' in window) {
      window.removeEventListener('deviceorientationabsolute', orientationHandler as EventListener);
    }
    window.removeEventListener('deviceorientation', orientationHandler as EventListener);
    orientationHandler = null;
  }
}

function close() {
  stopCompass();
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

onMounted(() => {
  updateQiblaDirection();
  requestOrientationPermission();
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
});

onUnmounted(() => {
  stopCompass();
});
</script>

<style scoped>
.qibla-view {
  position: absolute;
  inset: 0;
  z-index: 50;
  overflow: hidden;
}

.bg {
  position: absolute;
  inset: 0;
  background: transparent;
  z-index: 0;
}


.content {
  position: relative;
  inset: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-top: max(16px, env(safe-area-inset-top));
  pointer-events: none;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}

.title {
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  font-size: 18px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}

.compass-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 40px 20px;
}

.compass {
  position: relative;
  --size: min(80vw, 400px);
  width: var(--size);
  height: var(--size);
  transition: transform 0.1s ease-out;
}

.compass-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.compass-mark {
  position: absolute;
  top: 0;
  left: 50%;
  transform-origin: 0 calc(var(--size) / 2);
  width: 2px;
  height: 20px;
}

.compass-mark-major {
  width: 3px;
  height: 30px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1px;
}

.compass-mark-minor {
  width: 1px;
  height: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.5px;
}

.qibla-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(0deg);
  transform-origin: center;
  color: rgba(255, 200, 0, 0.95);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  z-index: 10;
  pointer-events: none;
}

.compass-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 200, 0, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 11;
}

.direction-info {
  text-align: center;
  color: rgba(255, 255, 255, 0.95);
}

.direction-value {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  margin-bottom: 8px;
}

.direction-label {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.85;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.calibration-message {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.95);
}

.calibration-text {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.calibration-hint {
  font-size: 13px;
  opacity: 0.8;
}

.error-message {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: rgba(255, 59, 48, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 59, 48, 0.4);
  border-radius: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  max-width: 80%;
}
</style>
