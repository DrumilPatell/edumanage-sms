import { useQuery } from '@tanstack/react-query'
import { enrollmentsApi } from '../services/api'
import { Plus, X } from 'lucide-react'

export default function EnrollmentsPage() {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => enrollmentsApi.getEnrollments({ limit: 100 }),
  })

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      completed: 'badge-primary',
      dropped: 'badge-danger',
      withdrawn: 'badge-warning',
    }
    return badges[status] || 'badge-primary'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Enrollments</h1>
          <p className="text-slate-400 mt-1">Manage student course enrollments</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Enrollment
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Course</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Enrollment Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-white">{enrollment.student_name}</p>
                        <p className="text-sm text-slate-400">{enrollment.student_email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-white">{enrollment.course_name}</p>
                        <p className="text-sm text-amber-400">{enrollment.course_code}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(enrollment.enrollment_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {enrollments.length === 0 && (
              <p className="text-center py-12 text-slate-400">No enrollments found</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
