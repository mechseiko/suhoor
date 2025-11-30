// import { useState, useEffect } from 'react'
// import { Bell, CheckCircle, Moon } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'
// import { supabase } from '../config/supabase'

// export default function WakeUpTracker({ groupId, members }) {
//   const { currentUser } = useAuth()
//   const [wakeUpLogs, setWakeUpLogs] = useState([])
//   const [hasWokenUp, setHasWokenUp] = useState(false)
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     fetchTodayLogs()
//   }, [groupId])

//   const fetchTodayLogs = async () => {
//     try {
//       const today = new Date().toISOString().split('T')[0]

//       const { data, error } = await supabase
//         .from('wake_up_logs')
//         .select(
//           `
//           id,
//           user_id,
//           woke_up_at,
//           profiles (
//             email,
//             display_name
//           )
//         `
//         )
//         .eq('group_id', groupId)
//         .eq('date', today)

//       if (error) throw error

//       setWakeUpLogs(data || [])
//       setHasWokenUp(
//         data?.some(log => log.user_id === currentUser.uid) || false
//       )
//     } catch (err) {
//       console.error('Error fetching wake up logs:', err)
//     }
//   }

//   const handleWakeUp = async () => {
//     setLoading(true)
//     try {
//       const today = new Date().toISOString().split('T')[0]

//       const { error } = await supabase.from('wake_up_logs').insert({
//         user_id: currentUser.uid,
//         group_id: groupId,
//         date: today,
//       })

//       if (error) throw error

//       await fetchTodayLogs()
//     } catch (err) {
//       console.error('Error logging wake up:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getWakeUpStatus = userId => {
//     return wakeUpLogs.some(log => log.user_id === userId)
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
//           <Moon className="h-6 w-6 text-blue-600" />
//           <span>Today's Wake Up Tracker</span>
//         </h3>
//         {!hasWokenUp ? (
//           <button
//             onClick={handleWakeUp}
//             disabled={loading}
//             className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
//           >
//             <Bell className="h-5 w-5" />
//             <span>{loading ? 'Logging...' : "I'm Awake!"}</span>
//           </button>
//         ) : (
//           <div className="flex items-center space-x-2 text-green-600">
//             <CheckCircle className="h-5 w-5" />
//             <span className="font-medium">You're awake!</span>
//           </div>
//         )}
//       </div>

//       <div className="space-y-3">
//         {members.map(member => {
//           const isAwake = getWakeUpStatus(member.profiles.id)
//           const wakeUpTime = wakeUpLogs.find(
//             log => log.user_id === member.profiles.id
//           )?.woke_up_at

//           return (
//             <div
//               key={member.id}
//               className={`flex items-center justify-between p-4 rounded-lg border ${
//                 isAwake
//                   ? 'bg-green-50 border-green-200'
//                   : 'bg-gray-50 border-gray-200'
//               }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <div
//                   className={`w-3 h-3 rounded-full ${
//                     isAwake ? 'bg-green-500' : 'bg-gray-300'
//                   }`}
//                 ></div>
//                 <div>
//                   <div className="font-medium text-gray-900">
//                     {member.profiles.display_name || member.profiles.email}
//                   </div>
//                   {isAwake && wakeUpTime && (
//                     <div className="text-sm text-gray-500">
//                       Woke up at{' '}
//                       {new Date(wakeUpTime).toLocaleTimeString('en-US', {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//               {isAwake && <CheckCircle className="h-5 w-5 text-green-600" />}
//             </div>
//           )
//         })}
//       </div>

//       {wakeUpLogs.length === 0 && (
//         <div className="text-center py-8 text-gray-500">
//           No one has woken up yet today. Be the first!
//         </div>
//       )}
//     </div>
//   )
// }
