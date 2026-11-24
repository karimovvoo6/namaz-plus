import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface DhikrSet {
  id: string;
  name: string;
  description: string;
  target: number;
  arabic?: string;
  transliteration?: string;
}

export interface DhikrSession {
  setId: string;
  current: number;
  target: number;
  startTime: number;
}

export const useDhikrStore = defineStore('dhikr', () => {
  const sessions = ref<Record<string, DhikrSession>>({});
  const favorites = ref<Set<string>>(new Set());

  function getSession(setId: string, target: number): DhikrSession {
    if (!sessions.value[setId]) {
      sessions.value[setId] = {
        setId,
        current: 0,
        target,
        startTime: Date.now(),
      };
    }
    return sessions.value[setId];
  }

  function increment(setId: string) {
    const session = sessions.value[setId];
    if (session) {
      session.current = Math.min(session.current + 1, session.target);
      saveSessions();
    }
  }

  function reset(setId: string) {
    if (sessions.value[setId]) {
      sessions.value[setId].current = 0;
      sessions.value[setId].startTime = Date.now();
      saveSessions();
    }
  }

  function setTarget(setId: string, target: number) {
    const session = getSession(setId, target);
    session.target = target;
    if (session.current > target) {
      session.current = target;
    }
    saveSessions();
  }

  function toggleFavorite(setId: string) {
    if (favorites.value.has(setId)) {
      favorites.value.delete(setId);
    } else {
      favorites.value.add(setId);
    }
    saveFavorites();
  }

  function isFavorite(setId: string): boolean {
    return favorites.value.has(setId);
  }

  function saveSessions() {
    localStorage.setItem('dhikrSessions', JSON.stringify(sessions.value));
  }

  function saveFavorites() {
    localStorage.setItem('dhikrFavorites', JSON.stringify(Array.from(favorites.value)));
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('dhikrSessions');
      if (stored) {
        sessions.value = JSON.parse(stored);
      }

      const storedFavorites = localStorage.getItem('dhikrFavorites');
      if (storedFavorites) {
        favorites.value = new Set(JSON.parse(storedFavorites));
      }
    } catch (err) {
      console.error('Failed to load dhikr from storage:', err);
    }
  }

  return {
    sessions,
    favorites,
    getSession,
    increment,
    reset,
    setTarget,
    toggleFavorite,
    isFavorite,
    loadFromStorage,
  };
});
