import { useNavigate } from 'react-router-dom'
import { Users, Calendar, Copy, CopyCheck } from 'lucide-react'
import { useState } from 'react';

export default function GroupList({ groups }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false);
  const [clicked, setClicked] = useState();

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      {groups.map((group) => {
        const groupName = group.name;
        return (
          <div
            key={group.id}
            onClick={() => navigate(`/group/${group.id}`)}
            className="group bg-white rounded-2xl shadow-xs border border-gray-50 p-4 hover:shadow-sm hover:border-primary/20 transition-all duration-200 relative overflow-hidden cursor-pointer"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {groupName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {groupName.charAt(0).toUpperCase()}{groupName.slice(1, groupName.length)}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-mono text-gray-700">{group.group_key}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCopied(true);
                        setClicked(group.id)
                        navigator.clipboard.writeText(`${group.group_key}`)
                        setTimeout(() => {
                          setCopied(false)
                        }, 2000)
                      }}
                      className="ml-auto cursor-pointer p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-primary transition-colors"
                      title="Copy Group Key"
                    >
                      {copied && clicked === group.id ? <div className='flex gap-2 items-center text-xs'><CopyCheck className="h-4 w-4" /><span>Copied</span></div> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        Created {group.created_at ?
                          (group.created_at.toDate ? group.created_at.toDate() : new Date(group.created_at))
                            .toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Just now'
                        }
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                      {group.member_count || 0} {group.member_count === 1 ? 'Member' : 'Members'}
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
