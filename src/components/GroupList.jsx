import { useNavigate } from 'react-router-dom'
import { Users, Calendar, Share, Copy } from 'lucide-react'

export default function GroupList({ groups }) {
  const navigate = useNavigate()

  return (
    <div className="grid gap-4">
      {groups.map((group, index) => {
        const groupName = group.name.toLocaleUpperCase();
        return(
        <div
          key={group.id}
          onClick={() => navigate(`/group/${group.id}`)}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer border border-muted"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-dark mb-2">
                {(groupName)}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-dark/70">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Group Key: {group.group_key}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </span>
                  <span className='flex'>
                    <span onClick={() => {
                    navigator.clipboard.writeText(`https://suhoor-group.web.app/dashboard/groups?groupKey=${group.group_key}`)
                     alert(`Link to join ${groupName} has been copied to your clipboard!`)
                    }}
                     ><Copy /></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      )}
    </div>
  )
}
