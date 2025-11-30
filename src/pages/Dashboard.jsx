// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Moon, LogOut, Plus, Users } from 'lucide-react'
// import { useAuth } from '../context/AuthContext'
// import { supabase } from '../config/supabase'
// import GroupList from '../components/GroupList'
// import CreateGroupModal from '../components/CreateGroupModal'
// import JoinGroupModal from '../components/JoinGroupModal'
// import FastingTimes from '../components/FastingTimes'

// export default function Dashboard() {
//   const { currentUser, logout } = useAuth()
//   const navigate = useNavigate()
//   const [showCreateModal, setShowCreateModal] = useState(false)
//   const [showJoinModal, setShowJoinModal] = useState(false)
//   const [groups, setGroups] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (currentUser) {
//       createOrUpdateProfile()
//       fetchGroups()
//     }
//   }, [currentUser])

//   const createOrUpdateProfile = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('id')
//         .eq('id', currentUser.uid)
//         .maybeSingle()

//       if (!data) {
//         await supabase.from('profiles').insert({
//           id: currentUser.uid,
//           email: currentUser.email,
//           display_name: currentUser.email.split('@')[0],
//         })
//       }
//     } catch (err) {
//       console.error('Error with profile:', err)
//     }
//   }

//   const fetchGroups = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('group_members')
//         .select(
//           `
//           group_id,
//           groups (
//             id,
//             name,
//             group_key,
//             created_at
//           )
//         `
//         )
//         .eq('user_id', currentUser.uid)

//       if (error) throw error

//       const groupsData = data.map(item => item.groups)
//       setGroups(groupsData)
//     } catch (err) {
//       console.error('Error fetching groups:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleLogout = async () => {
//     try {
//       await logout()
//       navigate('/')
//     } catch (err) {
//       console.error('Logout failed:', err)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <Moon className="h-8 w-8 text-blue-600" />
//               <span className="text-2xl font-bold text-gray-900">Suhoor</span>
//             </div>
//             <div className="flex items-center space-x-4">
//               <span className="text-gray-600">{currentUser?.email}</span>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
//               >
//                 <LogOut className="h-5 w-5" />
//                 <span>Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <main className="container mx-auto px-6 py-8">
//         <div className="grid lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-3xl font-bold text-gray-900">Your Groups</h2>
//               <div className="flex space-x-3">
//                 <button
//                   onClick={() => setShowJoinModal(true)}
//                   className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
//                 >
//                   <Users className="h-5 w-5" />
//                   <span>Join Group</span>
//                 </button>
//                 <button
//                   onClick={() => setShowCreateModal(true)}
//                   className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                   <Plus className="h-5 w-5" />
//                   <span>Create Group</span>
//                 </button>
//               </div>
//             </div>

//             {loading ? (
//               <div className="text-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//               </div>
//             ) : groups.length === 0 ? (
//               <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//                 <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                   No groups yet
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   Create a new group or join an existing one to get started
//                 </p>
//               </div>
//             ) : (
//               <GroupList groups={groups} onUpdate={fetchGroups} />
//             )}
//           </div>

//           <div className="lg:col-span-1">
//             <FastingTimes />
//           </div>
//         </div>
//       </main>

//       {showCreateModal && (
//         <CreateGroupModal
//           onClose={() => setShowCreateModal(false)}
//           onSuccess={() => {
//             setShowCreateModal(false)
//             fetchGroups()
//           }}
//         />
//       )}

//       {showJoinModal && (
//         <JoinGroupModal
//           onClose={() => setShowJoinModal(false)}
//           onSuccess={() => {
//             setShowJoinModal(false)
//             fetchGroups()
//           }}
//         />
//       )}
//     </div>
//   )
// }
