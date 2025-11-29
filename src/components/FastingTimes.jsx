import { useState, useEffect } from 'react'
import { Clock, Sun, Moon, Calendar } from 'lucide-react'

export default function FastingTimes() {
  const [fastingData, setFastingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFastingTimes()
  }, [])

  const fetchFastingTimes = async () => {
    try {
      const response = await fetch(
        'https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=Saudi%20Arabia&method=4'
      )
      const data = await response.json()

      if (data.code === 200) {
        const timings = data.data.timings
        const date = data.data.date

        setFastingData({
          fasting: [
            {
              date: date.gregorian.date,
              hijri: date.hijri.date,
              hijri_readable: `${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year} AH`,
              time: {
                sahur: timings.Fajr,
                iftar: timings.Maghrib,
              },
            },
          ],
        })
      }
    } catch (err) {
      setError('Failed to load fasting times')
      console.error('Error fetching fasting times:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const todayData = fastingData?.fasting?.[0]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Today's Times</h3>
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
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Moon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Suhoor Ends</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {todayData.time.sahur}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Sun className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Iftar Begins</span>
              </div>
              <span className="text-xl font-bold text-orange-600">
                {todayData.time.iftar}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center pt-4 border-t">
            Times are approximate. Please verify with your local mosque.
          </div>
        </div>
      )}
    </div>
  )
}
