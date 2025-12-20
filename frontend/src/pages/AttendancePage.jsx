import { useQuery } from '@tanstack/react-query'
import { academicApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Plus } from 'lucide-react'

export default function AttendancePage() {
  const { user } = useAuthStore()
  const canEdit = user?.role === 'admin' || user?.role === 'faculty'
  
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => academicApi.getAttendance({ limit: 100 }),
  })

  const getStatusBadge = (status) => {
    const badges = {
      present: 'badge-success',
      absent: 'badge-danger',
      late: 'badge-warning',
      excused: 'badge-primary',
    }
    return badges[status] || 'badge-primary'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 mt-1">Track student attendance records</p>
        </div>
        {canEdit && (
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Mark Attendance
          </button>
        )}
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Student ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Course ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-white">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{record.student_id}</td>
                    <td className="py-3 px-4 text-slate-400">{record.course_id}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{record.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {attendance.length === 0 && (
              <p className="text-center py-12 text-slate-400">No attendance records found</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
