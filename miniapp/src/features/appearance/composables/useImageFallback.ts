import { ref, computed } from 'vue';
import type { WallpaperItem } from '../data/wallpapers';

// Кэш для хранения результатов проверки URL
const urlCache = new Map<string, string>();

/**
 * Composable для автоматического fallback между удалёнными и локальными изображениями
 * 
 * Логика:
 * 1. Если есть localUrl — используем его как приоритетный
 * 2. Если есть только remoteUrl — используем его
 * 3. Кэшируем результаты для производительности
 */
export function useImageFallback(item: WallpaperItem) {
    const currentUrl = ref<string>('');

    // Определяем URL для использования
    const imageUrl = computed(() => {
        const cacheKey = item.id;

        // Проверяем кэш
        if (urlCache.has(cacheKey)) {
            return urlCache.get(cacheKey)!;
        }

        // Приоритет: localUrl > remoteUrl > url
        let url = '';
        if (item.localUrl) {
            url = item.localUrl;
        } else if (item.remoteUrl) {
            url = item.remoteUrl;
        } else if (item.url) {
            url = item.url;
        }

        // Сохраняем в кэш
        if (url) {
            urlCache.set(cacheKey, url);
        }

        return url;
    });

    // Обработчик ошибки загрузки
    const handleError = (event: Event) => {
        const img = event.target as HTMLImageElement;
        const cacheKey = item.id;

        // Если ошибка при загрузке remoteUrl и есть localUrl
        if (item.remoteUrl && item.localUrl && urlCache.get(cacheKey) === item.remoteUrl) {
            console.warn(`Failed to load remote image for ${item.id}, falling back to local`);
            urlCache.set(cacheKey, item.localUrl);
            currentUrl.value = item.localUrl;
            img.src = item.localUrl;
        }
    };

    currentUrl.value = imageUrl.value;

    return {
        imageUrl,
        handleError,
    };
}

/**
 * Получить финальный URL изображения с учётом fallback
 */
export function getImageUrl(item: WallpaperItem): string {
    // Приоритет: localUrl > remoteUrl > url
    return item.localUrl || item.remoteUrl || item.url || '';
}
