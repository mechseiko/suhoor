import { useState, useEffect } from 'react'
import { Clock, Sun, Moon, Calendar } from 'lucide-react'
import Loader from './Loader';

export default function FastingTimes() {

  const [location, setLocation] = useState({
    loaded: false,
    coordinates: { lat: null, lng: null },
    error: null,
  });

  const [fastingData, setFastingData] = useState(null)
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    if (!location.loaded) return;
    if (!location.coordinates.lat || !location.coordinates.lng) return;

    const fetchFastingTimes = async () => {
      console.log(location.coordinates.lat, location.coordinates.lng)
      try {
        const response = await fetch(
          `https://islamicapi.com/api/v1/fasting/?lat=${location.coordinates.lat}&lon=${location.coordinates.lng}&api_key=A3A2CmTNN6m2l7pZhjCr2og3iscpW6AoFCGvOdzaiXpT3hKs`
        );
        const data = await response.json();

        if (data.code === 200 && data.data.fasting) {
          setFastingData({ fasting: data.data.fasting });
        }
      } catch (err) {
        setError("Failed to load fasting times");
      } finally {
        setLoading(false);
      }
    };

    fetchFastingTimes();
  }, [location.loaded, location.coordinates.lat, location.coordinates.lng]);

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
    <div className="md:p-1 p-3 sticky top-8">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Today's Fasting Times</h3>
      </div>

      {todayData && (
        <div className="space-y-6">
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

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <Moon className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900">Suhoor Ends</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {todayData.time.sahur}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center space-x-3">
                <Sun className="h-5 w-5 text-secondary" />
                <span className="font-medium text-gray-900">Iftar Begins</span>
              </div>
              <span className="text-xl font-bold text-secondary">
                {todayData.time.iftar}
              </span>
            </div>

            {todayData.time.duration && (
              <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-accent" />
                  <span className="font-medium text-gray-900">Fasting Duration</span>
                </div>
                <span className="text-lg font-bold text-accent">
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
