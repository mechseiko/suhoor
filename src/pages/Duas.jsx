import PageLayout from '../layouts/PageLayout'
import { Moon, Sun, Heart, Volume2 } from 'lucide-react'

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
            arabic: "اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
            transliteration: "Allahumma inni laka sumtu wa bika aamantu wa 'alayka tawakkaltu wa 'ala rizq-ika aftartu",
            translation: "O Allah! I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance.",
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
        <PageLayout>
            <div className="py-12 md:py-20">
                <div className="text-center mb-16 px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Duas & Adhkar
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Essential supplications to illuminate your fasting journey. Recite these with presence of heart.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-8 px-4">
                    {duas.map((dua, idx) => {
                        const Icon = dua.icon
                        return (
                            <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <div className="p-8 md:p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className={`p-3 rounded-2xl ${dua.bg}`}>
                                            <Icon className={`h-6 w-6 ${dua.color}`} />
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
        </PageLayout>
    )
}
