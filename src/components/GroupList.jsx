import { useNavigate } from 'react-router-dom'
import { Users, Calendar, Share, Copy } from 'lucide-react'

export default function GroupList({ groups }) {
  const navigate = useNavigate()

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => {
        const groupName = group.name;
        return (
          <div
            key={group.id}
            onClick={() => navigate(`/group/${group.id}`)}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Share className="h-5 w-5 text-gray-400 hover:text-primary" />
            </div>

            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {groupName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {groupName}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-mono text-gray-700">{group.group_key}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`https://suhoor-group.web.app/dashboard/groups?groupKey=${group.group_key}`)
                        // You might want to add a toast notification here instead of alert
                        alert(`Link copied!`)
                      }}
                      className="ml-auto p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-primary transition-colors"
                      title="Copy Invite Link"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      Created {new Date(group.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                <span className="text-primary font-medium group-hover:underline">View Dashboard</span>
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="text-xs">→</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
