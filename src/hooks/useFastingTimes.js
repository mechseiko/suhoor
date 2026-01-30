import { useState, useEffect } from 'react'

export function useFastingTimes() {
    const [location, setLocation] = useState({
        loaded: false,
        coordinates: { lat: null, lng: null },
        error: null,
    });

    const [fastingData, setFastingData] = useState(() => {
        const cached = localStorage.getItem('suhoor_fasting_times')
        if (!cached) return null

        try {
            const parsed = JSON.parse(cached)
            const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

            // Invalidate cache if it's from a different day
            if (parsed.date !== today) {
                localStorage.removeItem('suhoor_fasting_times')
                return null
            }

            return parsed.data
        } catch {
            localStorage.removeItem('suhoor_fasting_times')
            return null
        }
    })

    const [loading, setLoading] = useState(!fastingData)
    const [error, setError] = useState('')

    // Get Location
    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setLocation(prev => ({ ...prev, loaded: true, error: "Geolocation not supported" }));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    loaded: true,
                    coordinates: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    },
                    error: null,
                });
            },
            (err) => {
                setLocation({
                    loaded: true,
                    coordinates: { lat: null, lng: null },
                    error: err.message,
                });
            }
        );
    }, []);

    // Fetch Times
    useEffect(() => {
        const fetchFastingTimes = async () => {
            if (!location.coordinates.lat || !location.coordinates.lng) return;
            // If we already have data, don't refetch unless force refresh (not impl here for simplicity)
            if (fastingData) {
                setLoading(false);
                return;
            }

            setLoading(true)
            setError('')

            try {
                const response = await fetch(
                    `https://islamicapi.com/api/v1/fasting/?lat=${location.coordinates.lat}&lon=${location.coordinates.lng}&api_key=A3A2CmTNN6m2l7pZhjCr2og3iscpW6AoFCGvOdzaiXpT3hKs`
                );
                const data = await response.json();

                if (data.code === 200 && data.data.fasting) {
                    const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
                    const newFastingData = { fasting: data.data.fasting }

                    setFastingData(newFastingData);

                    // Cache with timestamp and date
                    localStorage.setItem('suhoor_fasting_times', JSON.stringify({
                        data: newFastingData,
                        date: today,
                        timestamp: Date.now()
                    }))
                }
            } catch (err) {
                setError("Failed to load fasting times.");
            } finally {
                setLoading(false);
            }
        };

        if (location.loaded) {
            fetchFastingTimes();
        }
    }, [location.loaded, location.coordinates.lat, location.coordinates.lng, fastingData]);

    const todayData = fastingData?.fasting?.[0];

    // Helper to check if we are in the "Wake Up Window"
    // Defined as: 45 to 30 minutes before Suhoor time (15 minute window)
    const checkWakeUpWindow = () => {
        if (!todayData?.time?.sahur) return false;

        // Parse Suhoor time (e.g. "04:30")
        const [hours, minutes] = todayData.time.sahur.split(':').map(Number);

        const now = new Date();
        const suhoorDate = new Date();
        suhoorDate.setHours(hours, minutes, 0, 0);

        // Window starts 45 mins before and ends 30 mins before
        const windowStart = new Date(suhoorDate.getTime() - 45 * 60000);
        const windowEnd = new Date(suhoorDate.getTime() - 30 * 60000);

        return now >= windowStart && now <= windowEnd;
    };

    return {
        fastingData,
        todayData,
        loading,
        error,
        location,
        isWakeUpWindow: checkWakeUpWindow()
    };
}
