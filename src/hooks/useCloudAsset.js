import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

/**
 * Custom hook to fetch and cache Firebase Storage asset URLs
 * @param {string} storagePath - Path to the file in Firebase Storage (e.g., 'books/book-of-fasting.pdf')
 * @returns {object} - { url, loading, error }
 */
export function useCloudAsset(storagePath) {
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!storagePath) {
            setLoading(false);
            return;
        }

        // Check localStorage cache first
        const cacheKey = `cloud_asset_${storagePath}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            try {
                const { url: cachedUrl, timestamp } = JSON.parse(cached);
                // Cache valid for 7 days
                const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

                if (Date.now() - timestamp < CACHE_DURATION) {
                    setUrl(cachedUrl);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                // Invalid cache, continue to fetch
                localStorage.removeItem(cacheKey);
            }
        }

        // Fetch from Firebase Storage
        const fetchUrl = async () => {
            try {
                const storage = getStorage();
                const storageRef = ref(storage, storagePath);
                const downloadUrl = await getDownloadURL(storageRef);

                setUrl(downloadUrl);
                setError(null);

                // Cache the URL
                localStorage.setItem(cacheKey, JSON.stringify({
                    url: downloadUrl,
                    timestamp: Date.now()
                }));
            } catch (err) {
                console.error(`Error fetching cloud asset ${storagePath}:`, err);
                setError(err);
                setUrl(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUrl();
    }, [storagePath]);

    return { url, loading, error };
}
