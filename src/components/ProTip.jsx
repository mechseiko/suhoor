

export default function ProTip() {

    return (
        <div className="mt-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
                <p className="text-blue-100 text-sm leading-relaxed">
                    Stay hydrated during non-fasting hours. Try to drink at least 8 glasses of water between Iftar and Suhoor.
                </p>
            </div>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-20 w-20 bg-blue-400 opacity-20 rounded-full blur-xl"></div>
        </div>
    )
}
