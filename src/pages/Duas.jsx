import { useState } from 'react'
import { Moon, Sun, Heart, Sparkles, Users, ChevronDown } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../layouts/DashboardLayout'

export const duas = [
  {
    title: "Intention for Suhoor",
    arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
    transliteration: "Wa bisawmi ghadin nawaiytu min shahri Ramadan",
    translation: "I intend to keep the fast for tomorrow in the month of Ramadan.",
    icon: Moon,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "Dua for Breaking Fast",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
    transliteration: "Dhahaba adh-dhama'u wabtallatil 'urooqu wa thabatal ajru in sha Allah",
    translation: "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
    icon: Sun,
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  {
    title: "Dua for Lailatul Qadr",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    transliteration: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
    translation: "O Allah, You are Forgiving and love forgiveness, so forgive me.",
    icon: Heart,
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    title: "Dua for Goodness",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil 'akhirati hasanatan waqina 'adhaban-nar",
    translation: "Our Lord! Give us in this world that which is good and in the Hereafter that which is good, and save us from the torment of the Fire.",
    icon: Sparkles,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    title: "Dua for Parents",
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbi irhamhuma kama rabbayani saghira",
    translation: "My Lord, have mercy upon them as they brought me up [when I was] small.",
    icon: Users,
    color: "text-teal-600",
    bg: "bg-teal-50"
  }
]

export default function Duas() {
  const { currentUser } = useAuth()
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  const content = (
    <div className={`${currentUser ? '' : 'md:pt-15 pt-12 pb-8 px-4 mt-5'}`}>
      <div className="text-center mb-8">
        <SectionHeader
          title="Duas & Adhkar"
          subtitle="Essential supplications to illuminate your fasting journey. Recite these with presence of heart."
          className="px-4 mb-6"
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-4 px-2">
        {duas.map((dua, idx) => {
          const Icon = dua.icon
          const isOpen = openIndex === idx

          return (
            <div
              key={idx}
              className="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all"
            >
              {/* Header (FAQ Question) */}
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 md:p-3 rounded-xl ${dua.bg}`}>
                    <Icon className={`h-5 w-5 md:h-6 md:w-6 ${dua.color}`} />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    {dua.title}
                  </h2>
                </div>

                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Content (FAQ Answer) */}
              {isOpen && (
                <div className="px-5 md:px-8 pb-6 pt-2 border-t border-gray-100 space-y-4 text-center animate-fadeIn">
                  <p
                    className="text-2xl md:text-3xl leading-relaxed font-serif text-gray-800"
                    dir="rtl"
                  >
                    {dua.arabic}
                  </p>

                  <div className="space-y-2">
                    <p className="text-lg text-primary font-medium">
                      {dua.transliteration}
                    </p>
                    <p className="text-gray-600 italic">
                      “{dua.translation}”
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  return currentUser ? (
    <DashboardLayout>{content}</DashboardLayout>
  ) : (
    content
  )
}
