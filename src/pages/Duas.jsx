import { Moon, Sun, Heart } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

export default function Duas() {
    const duas = [
        {
            title: "Intention for Suhoor (Niyyah)",
            arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
            transliteration: "Wa bisawmi ghadin nawaiytu min shahri Ramadan",
            translation: "I intend to keep the fast for tomorrow in the month of Ramadan.",
            icon: Moon,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Dua for Breaking Fast (Iftar)",
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
        }
    ]

    return (
        <div className="py-8 md:py-20">
            <SectionHeader
                title="Duas & Adhkar"
                subtitle="Essential supplications to illuminate your fasting journey. Recite these with presence of heart."
                className="px-4 mb-8"
            />

            <div className="max-w-3xl mx-auto space-y-4 md:space-y-8 px-4">
                {duas.map((dua, idx) => {
                    const Icon = dua.icon
                    return (
                        <div key={idx} className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="p-6 md:p-10">
                                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                                    <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${dua.bg}`}>
                                        <Icon className={`h-5 w-5 md:h-6 md:w-6 ${dua.color}`} />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                        {dua.title}
                                    </h2>
                                </div>

                                <div className="space-y-8 text-center">
                                    <p className="text-3xl md:text-4xl leading-relaxed font-serif text-gray-800" dir="rtl">
                                        {dua.arabic}
                                    </p>

                                    <div className="space-y-2">
                                        <p className="text-lg text-primary font-medium">
                                            {dua.transliteration}
                                        </p>
                                        <p className="text-gray-600 italic">
                                            "{dua.translation}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
