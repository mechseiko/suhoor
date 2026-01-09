import { useState, useEffect } from 'react'
import { Clock, Sun, Moon, RefreshCw } from 'lucide-react'
import Loader from './Loader';

export default function FastingTimes() {

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
      const today = new Date().toISOString().split('T')[0]

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
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const onSuccess = (position) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      error: null,
    });
  };

  const onError = (err) => {
    setLocation({
      loaded: true,
      coordinates: { lat: null, lng: null },
      error: err.message,
    });
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      onError({ message: "Geolocation not supported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, []);

  const fetchFastingTimes = async (isRefresh = false) => {
    if (!location.coordinates.lat || !location.coordinates.lng) return;

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError('')

    try {
      const response = await fetch(
        `https://islamicapi.com/api/v1/fasting/?lat=${location.coordinates.lat}&lon=${location.coordinates.lng}&api_key=A3A2CmTNN6m2l7pZhjCr2og3iscpW6AoFCGvOdzaiXpT3hKs`
      );
      const data = await response.json();

      if (data.code === 200 && data.data.fasting) {
        const today = new Date().toISOString().split('T')[0]
        const fastingData = { fasting: data.data.fasting }

        setFastingData(fastingData);

        // Cache with timestamp and date
        localStorage.setItem('suhoor_fasting_times', JSON.stringify({
          data: fastingData,
          date: today,
          timestamp: Date.now()
        }))
      }
    } catch (err) {
      setError("Failed to load fasting times.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!location.loaded) return;
    if (!location.coordinates.lat || !location.coordinates.lng) return;
    if (fastingData) return; // Don't fetch if we have valid cached data

    fetchFastingTimes();
  }, [location.loaded, location.coordinates.lat, location.coordinates.lng]);

  const handleRefresh = () => {
    fetchFastingTimes(true);
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <Loader />
        Loading fasting times...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const todayData = fastingData?.fasting?.[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:p-6 p-3">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Moon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Today's Fasting Times</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors disabled:opacity-50"
          title="Refresh fasting times"
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {todayData && (
        <div className="md:space-y-6 space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Gregorian Date</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(todayData.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Hijri Date</div>
            <div className="text-lg font-semibold text-gray-900">
              {todayData.hijri_readable}
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Moon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700">Suhoor Ends</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {todayData.time.sahur}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-xl border border-secondary/10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Sun className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-sm font-medium text-gray-700">Iftar Begins</span>
              </div>
              <span className="text-lg font-bold text-secondary">
                {todayData.time.iftar}
              </span>
            </div>

            {todayData.time.duration && (
              <div className="flex items-center justify-between p-3 bg-accent/5 rounded-xl border border-accent/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Clock className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Fasting Duration</span>
                </div>
                <span className="text-sm font-bold text-accent">
                  {todayData.time.duration}
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-dark/60 text-center pt-4 border-t border-muted">
            Times are approximate. Please verify with your local mosque.
          </div>
        </div>
      )}
    </div>
  );
}
