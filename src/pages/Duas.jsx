import { useState } from 'react'
import { Moon, Sun, Heart, Sparkles, Users, BookOpen } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../layouts/DashboardLayout'

export const duas = [
  {
    title: "Dua for Breaking Fast",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
    transliteration: "Dhahaba adh-dhama'u wabtallatil 'urooqu wa thabatal ajru in sha Allah",
    translation: "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
    icon: Sun,
  },
  {
    title: "Dua for Lailatul Qadr",
    arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    transliteration: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
    translation: "O Allah, You are Forgiving and love forgiveness, so forgive me.",
    icon: Heart,
  },
  {
    title: "Dua for Goodness",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil 'akhirati hasanatan waqina 'adhaban-nar",
    translation: "Our Lord! Give us in this world that which is good and in the Hereafter that which is good, and save us from the torment of the Fire.",
    icon: Sparkles,
  },
  {
    title: "Dua for Parents",
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbi irhamhuma kama rabbayani saghira",
    translation: "My Lord, have mercy upon them as they brought me up [when I was] small.",
    icon: Users,
  }
]

export default function Duas() {
  const { currentUser } = useAuth()

  const content = (
    <div className={`${currentUser ? '' : 'md:pt-15 pt-12 pb-8 px-4 mt-5'}`}>
      <div className="text-center mb-12">
        <SectionHeader
          title="Duas & Adhkar"
          subtitle="Essential supplications to illuminate your fasting journey. Recite these with presence of heart."
          className="px-4 mb-6"
        />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {duas.map((dua, idx) => {
          const Icon = dua.icon

          return (
            <div
              key={idx}
              className="group flex flex-col justify-between bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <section>
                <div className={`bg-primary p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-xl font-bold">
                        {dua.title}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="md:p-6 p-4 space-y-4">
                  <div className="text-center">
                    <p
                      className="text-3xl leading-relaxed font-serif text-gray-800 mb-4"
                      dir="rtl"
                    >
                      {dua.arabic}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl md:p-4 p-2 border border-gray-200">
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-700 italic">
                        {dua.transliteration}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-gray-600 leading-relaxed italic">
                      "{dua.translation}"
                    </p>
                  </div>
                </div>
              </section>
              <div className={`h-1 bg-primary`}></div>
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
