import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { i18n } from '../i18n';

const { t } = i18n.global;

export interface Location {
  // ...
  id: string;
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export const DEFAULT_LOCATION: Location = {
  id: 'loc_default_khujand',
  name: 'Худжанд',
  region: 'Согдийская область',
  country: 'Таджикистан',
  latitude: 40.2856,
  longitude: 69.6229,
  displayName: 'Худжанд, Таджикистан',
};

export const useLocationStore = defineStore('location', () => {
  const currentLocation = ref<Location | null>(null);
  const savedLocations = ref<Location[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const displayName = computed(() => {
    if (!currentLocation.value) return '';
    return currentLocation.value.displayName;
  });

  // Reverse geocoding через Nominatim
  async function reverseGeocode(lat: number, lng: number): Promise<Location> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NamazApp/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const address = data.address || {};

      const name = address.city || address.town || address.village || address.municipality || '';
      const region = address.state || address.region || '';
      const country = address.country || '';

      let displayName = name;
      if (region && region !== name) {
        displayName += `, ${region}`;
      }
      if (country && !displayName.includes(country)) {
        displayName += `, ${country}`;
      }

      return {
        id: `loc_${Date.now()}`,
        name,
        region,
        country,
        latitude: lat,
        longitude: lng,
        displayName: displayName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
    } catch (err) {
      throw new Error(t('location.error'));
    }
  }

  // Поиск городов через Nominatim
  async function searchCities(query: string): Promise<Location[]> {
    if (!query.trim()) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NamazApp/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      return data.map((item: any) => {
        const address = item.address || {};
        const name = address.city || address.town || address.village || address.municipality || item.display_name.split(',')[0];
        const region = address.state || address.region || '';
        const country = address.country || '';

        let displayName = name;
        if (region && region !== name) {
          displayName += `, ${region}`;
        }
        if (country && !displayName.includes(country)) {
          displayName += `, ${country}`;
        }

        return {
          id: `search_${item.place_id}`,
          name,
          region,
          country,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          displayName: displayName || item.display_name,
        };
      });
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }

  // Определение геолокации
  async function detectLocation(): Promise<Location> {
    isLoading.value = true;
    error.value = null;

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        error.value = t('error.geo_not_supported');
        isLoading.value = false;
        reject(new Error(t('error.geo_not_supported')));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const location = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
            setCurrentLocation(location);
            isLoading.value = false;
            resolve(location);
          } catch (err) {
            error.value = err instanceof Error ? err.message : 'Ошибка определения местоположения';
            isLoading.value = false;
            reject(err);
          }
        },
        (err) => {
          error.value = t('location.error');
          isLoading.value = false;
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  function setCurrentLocation(location: Location) {
    currentLocation.value = location;
    // Сохраняем в localStorage
    localStorage.setItem('currentLocation', JSON.stringify(location));
  }

  function addSavedLocation(location: Location) {
    if (!savedLocations.value.find((l) => l.id === location.id)) {
      savedLocations.value.push(location);
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations.value));
    }
  }

  function removeSavedLocation(id: string) {
    savedLocations.value = savedLocations.value.filter((l) => l.id !== id);
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations.value));
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('currentLocation');
      if (stored) {
        currentLocation.value = JSON.parse(stored);
      } else {
        currentLocation.value = DEFAULT_LOCATION;
      }

      const saved = localStorage.getItem('savedLocations');
      if (saved) {
        savedLocations.value = JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load location from storage:', err);
    }
  }

  return {
    currentLocation,
    savedLocations,
    isLoading,
    error,
    displayName,
    detectLocation,
    searchCities,
    setCurrentLocation,
    addSavedLocation,
    removeSavedLocation,
    loadFromStorage,
  };
});
