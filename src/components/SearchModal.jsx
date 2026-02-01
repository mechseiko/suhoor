import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { searchData } from '../config/searchData';

export default function SearchModal({ onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleNavigation = (page) => {
        const routes = {
            'Dashboard': '/dashboard',
            'Groups': '/groups',
            'Fasting': '/fasting',
            'Resources': '/books',
            'Duas': '/duas',
            'Profile': '/profile',
            'Settings': '/settings'
        }
        navigate(routes[page] || '/dashboard')
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-8 transform transition-all scale-100 animate-in zoom-in-95 duration-200 gap-4 flex flex-col h-auto max-h-[85vh]">
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Suhoor Search</h3>
                        <p className="text-gray-600 text-sm mt-1">What are you looking for?</p>
                    </div>
                    <button
                        className="p-2 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X onClick={onClose} className="h-6 w-6" />
                    </button>
                </div>

                <div className="relative shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Suhoor"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                        autoFocus
                    />
                </div>

                <div className="overflow-y-auto no-scrollbar min-h-0">
                    <div>
                        {searchQuery && searchData
                            .filter(item => {
                                const query = searchQuery.toLowerCase().trim()
                                if (!query) return false

                                return (
                                    item.page.toLowerCase().includes(query) ||
                                    item.queries.some(q => q.toLowerCase().includes(query))
                                )
                            })
                            .map((item, index) => {
                                const query = searchQuery.toLowerCase().trim()
                                const matchingQueries = item.queries.filter(q =>
                                    q.toLowerCase().includes(query) || item.page.toLowerCase().includes(query)
                                )

                                return (
                                    <div key={index} className="mb-2">
                                        {matchingQueries.map((match, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                                                onClick={() => handleNavigation(item.page)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="font-medium text-xl text-gray-900">{item.page}</span>
                                                    <span className="text-lg text-gray-500">&gt;</span>
                                                    <span className="text-lg text-gray-500">{match}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })
                        }

                        {searchQuery && searchData.every(item => {
                            const query = searchQuery.toLowerCase().trim()
                            return !(
                                item.page.toLowerCase().includes(query) ||
                                item.queries.some(q => q.toLowerCase().includes(query))
                            )
                        }) && (
                                <div className="text-center py-8 text-gray-500">
                                    No results found for "{searchQuery}"
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    )
}
