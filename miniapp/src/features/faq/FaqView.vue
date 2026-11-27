<template>
  <div class="faq-view">
    <div class="backdrop" @click="goBack" />
    
    <div class="sheet" @click.stop>
      <header class="header">
        <div class="title">{{ $t('faq.title') }}</div>
        <button class="closeBtn" @click="goBack" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </header>
      
      <div class="content">
        <!-- Search -->
        <SettingsCard>
          <div class="search-row">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              v-model="searchQuery" 
              type="text" 
              :placeholder="$t('faq.search')" 
              class="search-input"
            />
          </div>
        </SettingsCard>

        <!-- FAQ List -->
        <SettingsCard v-if="filteredFaq.length > 0">
           <div class="section-title">{{ $t('faq.qaTitle') }}</div>
           <div v-for="(item, index) in filteredFaq" :key="index" class="faq-item">
             <button class="faq-question" @click="toggle(index)">
               <span class="q-text">{{ item.q }}</span>
               <div class="chev" :class="{ open: openIndex === index }">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                   <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                 </svg>
               </div>
             </button>
             
             <div class="faq-answer" v-if="openIndex === index">
               {{ item.a }}
             </div>
             
             <div class="divider" v-if="index < filteredFaq.length - 1"></div>
           </div>
        </SettingsCard>
        
        <div v-else class="empty-state">
          {{ $t('faq.emptyState') }}
        </div>

        <!-- Support -->
        <SettingsCard>
          <div class="section-title">{{ $t('faq.supportTitle') }}</div>
          <SettingsRow 
            icon="help" 
            :title="$t('faq.contactSupport')" 
            @click="contactSupport"
          />
        </SettingsCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SettingsCard from '../profile/components/SettingsCard.vue';
import SettingsRow from '../profile/components/SettingsRow.vue';

const router = useRouter();
const { t } = useI18n();
const searchQuery = ref('');
const openIndex = ref<number | null>(null);

const faqItems = computed(() => [
  { 
    q: t('faq.items.times.q'), 
    a: t('faq.items.times.a') 
  },
  { 
    q: t('faq.items.method.q'), 
    a: t('faq.items.method.a') 
  },
  { 
    q: t('faq.items.offline.q'), 
    a: t('faq.items.offline.a') 
  },
  { 
    q: t('faq.items.notifications.q'), 
    a: t('faq.items.notifications.a') 
  },
  { 
    q: t('faq.items.location.q'), 
    a: t('faq.items.location.a') 
  },
  { 
    q: t('faq.items.theme.q'), 
    a: t('faq.items.theme.a') 
  },
  { 
    q: t('faq.items.language.q'), 
    a: t('faq.items.language.a') 
  },
]);

const filteredFaq = computed(() => {
  if (!searchQuery.value) return faqItems.value;
  const q = searchQuery.value.toLowerCase();
  return faqItems.value.filter(item => 
    item.q.toLowerCase().includes(q) || 
    item.a.toLowerCase().includes(q)
  );
});

function toggle(index: number) {
  if (openIndex.value === index) {
    openIndex.value = null;
  } else {
    openIndex.value = index;
  }
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

function contactSupport() {
  const tgUrl = 'https://t.me/+992927406717';
  if (window.Telegram?.WebApp?.openTelegramLink) {
    window.Telegram.WebApp.openTelegramLink(tgUrl);
  } else {
    window.open(tgUrl, '_blank');
  }
}
</script>

<style scoped>
.faq-view {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.sheet {
  position: absolute;
  inset: 0;
  padding: max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #141e23f2;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px;
}

.title {
  color: rgba(255, 255, 255, 0.92);
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 0.2px;
}

.closeBtn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
}

.section-title {
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.search-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.search-icon {
  color: rgba(255, 255, 255, 0.5);
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  outline: none;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.q-text {
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.chev {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.3s;
}

.chev.open {
  transform: rotate(180deg);
  color: #fbbf24;
}

.faq-answer {
  padding: 0 16px 16px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 16px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}
</style>
