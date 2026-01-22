import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { academicApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import api from '../lib/api'

export default function AttendancePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const canEdit = user?.role === 'admin' || user?.role === 'faculty'
  const [deleteId, setDeleteId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => academicApi.getAttendance({ limit: 500 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/academic/attendance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance'])
      setShowDeleteModal(false)
      setDeleteId(null)
    }
  })

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      present: 'badge-success',
      absent: 'badge-danger',
      late: 'badge-warning',
      excused: 'badge-primary',
    }
    return badges[status] || 'badge-primary'
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 mt-1">Track student attendance records</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => navigate('/mark-attendance')}
            className="btn-primary flex items-center gap-2"
          >
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
            <div className="p-4 border-b border-slate-700/50">
              <p className="text-sm text-slate-400">
                Showing {attendance.length} records
              </p>
            </div>
            <table className="w-full">
              <thead className="border-b border-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Course</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Notes</th>
                  {canEdit && (
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-white">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{record.student_name}</p>
                      <p className="text-sm text-slate-400">ID: {record.student_id}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{record.course_code}</p>
                      <p className="text-sm text-slate-400">{record.course_name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{record.notes || '-'}</td>
                    {canEdit && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/edit-attendance/${record.id}`)}
                            className="p-2 text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit attendance"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(record.id)}
                            className="p-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Delete attendance"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Delete Attendance Record</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this attendance record? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
