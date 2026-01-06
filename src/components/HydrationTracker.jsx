import { useState, useEffect, Activity } from 'react'
import { Droplet, Plus, Minus } from 'lucide-react'

export default function HydrationTracker() {
    const [glasses, setGlasses] = useState(0)
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        const saved = localStorage.getItem(`hydration_${today}`)
        if (saved) {
            setGlasses(parseInt(saved))
        }
    }, [today])

    const updateGlasses = (val) => {
        if(glasses >= 8 && val === 1) return;
        const newVal = Math.max(0, glasses + val)
        setGlasses(newVal)
        localStorage.setItem(`hydration_${today}`, newVal.toString())
    }

    return (
        <div className="bg-white/80 rounded-2xl p-6 border border-gray-100 shadow-sm mt-3">
            {glasses < 8 ?
            <><div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Droplet className="h-5 w-5 text-primary" />
                    </div>  
                    <div>
                        <h3 className="font-bold text-gray-900">Hydration</h3>
                        <p className="text-xs text-gray-500">Goal: 8 glasses</p>
                    </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{glasses}/8</span>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
                <button
                    onClick={() => updateGlasses(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-100"
                >
                    <Minus className="h-4 w-4 text-gray-400" />
                </button>
                <div className="flex gap-1">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-8 w-4 rounded-sm transition-all duration-500 ${i < glasses ? 'bg-blue-500 shadow-sm shadow-blue-200' : 'bg-gray-100'
                                }`}
                        />
                    ))}
                </div>
                <button
                    onClick={() => updateGlasses(1)}
                    className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors border border-blue-100"
                >
                    <Plus className="h-4 w-4 text-blue-600" />
                </button>
            </div></> :
            
            <div className='flex items-center bg-blue-50 rounded-lg'>
                <div className="p-2 ">
                    <Droplet className="h-5 w-5 text-primary" />
                </div> 
                <h3 className="font-bold text-center text-gray-900">Hydration goal reached.</h3>
            </div>}
        </div>
    )
}
