import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader';
import { useState, useEffect } from 'react';
import { RefreshCw, Moon, Sun, Clock, } from 'lucide-react';

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
      const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

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
  const { currentUser } = useAuth()
  const [customWakeUpTime, setCustomWakeUpTime] = useState('')
  const [savingTime, setSavingTime] = useState(false)
  const [timeError, setTimeError] = useState('')
  const [allowedTimeRange, setAllowedTimeRange] = useState({ min: '', max: '' })

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

  // Calculate allowed time range (15 min before, 5 min after Suhoor)
  const calculateTimeRange = (suhoorTime) => {
    if (!suhoorTime) return { min: '', max: '' };

    const [hours, minutes] = suhoorTime.split(':').map(Number);
    const suhoorDate = new Date();
    suhoorDate.setHours(hours, minutes, 0, 0);

    const minTime = new Date(suhoorDate.getTime() - 15 * 60000); // -15 mins
    const maxTime = new Date(suhoorDate.getTime() + 5 * 60000); // +5 mins

    return {
      min: `${String(minTime.getHours()).padStart(2, '0')}:${String(minTime.getMinutes()).padStart(2, '0')}`,
      max: `${String(maxTime.getHours()).padStart(2, '0')}:${String(maxTime.getMinutes()).padStart(2, '0')}`
    };
  };

  // Validate if time is within allowed range
  const isTimeInRange = (time, minTime, maxTime) => {
    if (!time || !minTime || !maxTime) return true; // Allow if no constraints
    return time >= minTime && time <= maxTime;
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
        const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
        const fastingData = { fasting: data.data.fasting }

        setFastingData(fastingData);

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

    // Fetch custom wake up time from profile
    const fetchProfileData = async () => {
      if (!currentUser) return
      try {
        const docRef = doc(db, 'profiles', currentUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setCustomWakeUpTime(docSnap.data().customWakeUpTime || '')
        }
      } catch (err) {
        console.error("Error fetching profile for wake up time", err)
      }
    }

    fetchProfileData()
    if (fastingData) return;

    fetchFastingTimes();
  }, [location.loaded, location.coordinates.lat, location.coordinates.lng, currentUser]);

  // Calculate allowed time range when fasting data changes
  useEffect(() => {
    if (fastingData?.fasting?.[0]?.time?.sahur) {
      const range = calculateTimeRange(fastingData.fasting[0].time.sahur);
      setAllowedTimeRange(range);
    }
  }, [fastingData]);

  const handleWakeUpTimeChange = async (e) => {
    const newTime = e.target.value
    setCustomWakeUpTime(newTime)
    setTimeError('') // Clear previous errors

    if (!currentUser) return

    // Validate time is within allowed range
    if (allowedTimeRange.min && allowedTimeRange.max) {
      if (!isTimeInRange(newTime, allowedTimeRange.min, allowedTimeRange.max)) {
        setTimeError(`Time must be between ${allowedTimeRange.min} and ${allowedTimeRange.max}`);
        return; // Don't save invalid time
      }
    }

    setSavingTime(true)
    try {
      const docRef = doc(db, 'profiles', currentUser.uid)
      await updateDoc(docRef, {
        customWakeUpTime: newTime
      })
    } catch (err) {
      console.error("Error updating wake up time", err)
      setTimeError('Failed to save wake-up time')
    } finally {
      setSavingTime(false)
    }
  }

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
        <h3 className="text-lg font-semibold text-gray-800">Today's Fasting Times</h3>
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

            <div className="pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-4 w-4 text-yellow-700" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">Personal Wake Up</span>
                      {allowedTimeRange.min && allowedTimeRange.max ? (
                        <span className="text-[10px] text-gray-500">Allowed: {allowedTimeRange.min} - {allowedTimeRange.max}</span>
                      ) : (
                        <span className="text-[10px] text-gray-500">Default: 15 minutes before Suhoor</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="time"
                      value={customWakeUpTime}
                      onChange={handleWakeUpTimeChange}
                      min={allowedTimeRange.min}
                      max={allowedTimeRange.max}
                      className="bg-white border border-yellow-200 rounded-lg px-2 py-1 text-sm font-bold text-yellow-800 outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {savingTime && <RefreshCw className="h-3 w-3 text-yellow-600 animate-spin" />}
                  </div>
                </div>
                {timeError && (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600 font-medium">{timeError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-dark/60 text-center pt-4 border-t border-muted">
            Times are approximate. Please verify with your local mosque.
          </div>
        </div>
      )}
    </div>
  );
}
