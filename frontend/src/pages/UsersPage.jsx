import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../services/api'
import { Edit, Trash2, UserPlus } from 'lucide-react'

export default function UsersPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers({ limit: 100 }),
  })

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      faculty: 'badge-warning',
      student: 'badge-primary',
    }
    return badges[role] || 'badge-primary'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 mt-1">Manage all system users</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <span className="text-sm font-semibold text-white">
                            {user.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <span className="font-medium text-white">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center py-12 text-slate-400">No users found</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
