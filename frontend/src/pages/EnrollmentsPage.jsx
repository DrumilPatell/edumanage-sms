import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { enrollmentsApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Plus, X, Edit } from 'lucide-react'

export default function EnrollmentsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === 'admin'
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => enrollmentsApi.getEnrollments({ limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (enrollmentId) => enrollmentsApi.deleteEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollments'])
      setDeleteConfirm(null)
    },
  })

  const handleDelete = (enrollmentId) => {
    deleteMutation.mutate(enrollmentId)
  }

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
        {isAdmin && (
          <button 
            onClick={() => navigate('/enroll-student')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Enrollment
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
                        <p className="text-sm text-slate-400">{enrollment.student_code}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-white">{enrollment.course_name}</p>
                        <p className="text-sm text-amber-400">{enrollment.course_code}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(enrollment.enrollment_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <>
                            <button 
                              onClick={() => navigate(`/edit-enrollment/${enrollment.id}`)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(enrollment)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500 text-sm">View Only</span>
                        )}
                      </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-2">Remove Enrollment</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to remove <span className="text-white font-semibold">{deleteConfirm.student_name}</span> from <span className="text-white font-semibold">{deleteConfirm.course_name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
