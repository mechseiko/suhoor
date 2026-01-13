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
            onClick={() => navigate(`/groups/${group.id}`)}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:border-primary/20 transition-all duration-200 relative overflow-hidden cursor-pointer"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {groupName.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {groupName}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <div className='flex items-center'>
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <div className='flex justify-between items-center'>
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
                          {copied && (clicked === group.id) ? <div className='flex gap-2 items-center text-xs'><CopyCheck className="h-4 w-4" /><span>Copied</span></div> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                      {group.member_count || 0} {group.member_count === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
