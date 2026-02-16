import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { academicApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Users, CheckCircle, XCircle, Clock, Filter, ChevronDown } from 'lucide-react'
import api from '../lib/api'

export default function AttendancePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const canEdit = user?.role === 'admin' || user?.role === 'faculty'
  const [deleteId, setDeleteId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => academicApi.getAttendance({ limit: 500 }),
    staleTime: 30000,
  })

  // Calculate stats
  const stats = useMemo(() => {
    const total = attendance.length
    const present = attendance.filter(r => r.status === 'present').length
    const absent = attendance.filter(r => r.status === 'absent').length
    const late = attendance.filter(r => r.status === 'late').length
    const excused = attendance.filter(r => r.status === 'excused').length
    return { total, present, absent, late, excused }
  }, [attendance])

  // Filter by status first, then by search term
  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      // Status filter
      if (statusFilter !== 'all' && record.status !== statusFilter) {
        return false
      }
      // Search filter
      const term = searchTerm.toLowerCase()
      if (!term) return true
      return (
        record.student_name?.toLowerCase().includes(term) ||
        record.student_code?.toLowerCase().includes(term) ||
        record.course_name?.toLowerCase().includes(term) ||
        record.course_code?.toLowerCase().includes(term) ||
        record.date?.toLowerCase().includes(term)
      )
    })
  }, [attendance, statusFilter, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage)
  const paginatedAttendance = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAttendance.slice(start, start + itemsPerPage)
  }, [filteredAttendance, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

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
            onClick={() => navigate('/mark-attendance', { state: { from: '/dashboard/attendance' } })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Mark Attendance
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/50 rounded-lg">
              <Users className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total Records</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.present}</p>
              <p className="text-xs text-slate-400">Present</p>
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
              <p className="text-xs text-slate-400">Absent</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.late}</p>
              <p className="text-xs text-slate-400">Late</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Filter className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{stats.excused}</p>
              <p className="text-xs text-slate-400">Excused</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'all', label: 'All', count: stats.total },
          { key: 'present', label: 'Present', count: stats.present },
          { key: 'absent', label: 'Absent', count: stats.absent },
          { key: 'late', label: 'Late', count: stats.late },
          { key: 'excused', label: 'Excused', count: stats.excused },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === tab.key
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and Items Per Page */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, course, or date..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Show:</label>
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
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
                {paginatedAttendance.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{record.student_name}</p>
                      <p className="text-xs text-slate-400">{record.student_code}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{record.course_code}</p>
                      <p className="text-xs text-slate-400" title={record.course_name}>{record.course_name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getStatusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm max-w-[150px] truncate">{record.notes || '-'}</td>
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
            {paginatedAttendance.length === 0 && (
              <p className="text-center py-12 text-slate-400">
                {searchTerm || statusFilter !== 'all' ? 'No attendance records match your filters' : 'No attendance records found'}
              </p>
            )}

            {/* Pagination */}
            {filteredAttendance.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAttendance.length)} of {filteredAttendance.length} records
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-amber-500 text-slate-900'
                              : 'bg-slate-700 text-white hover:bg-slate-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
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
