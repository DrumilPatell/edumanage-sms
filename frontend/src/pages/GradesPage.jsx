import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { academicApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Award, FileText, BookOpen, ClipboardList, Target, ChevronDown } from 'lucide-react'
import api from '../lib/api'

export default function GradesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const canEdit = user?.role === 'admin' || user?.role === 'faculty'
  const [deleteId, setDeleteId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: () => academicApi.getGrades({ limit: 500 }),
    staleTime: 30000,
  })

  // Calculate stats by assessment type
  const stats = useMemo(() => {
    const total = grades.length
    const quiz = grades.filter(r => r.assessment_type === 'quiz').length
    const midterm = grades.filter(r => r.assessment_type === 'midterm').length
    const final = grades.filter(r => r.assessment_type === 'final').length
    const assignment = grades.filter(r => r.assessment_type === 'assignment').length
    const project = grades.filter(r => r.assessment_type === 'project').length
    return { total, quiz, midterm, final, assignment, project }
  }, [grades])

  // Filter by type first, then by search term
  const filteredGrades = useMemo(() => {
    return grades.filter((record) => {
      // Type filter
      if (typeFilter !== 'all' && record.assessment_type !== typeFilter) {
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
        record.assessment_name?.toLowerCase().includes(term) ||
        record.letter_grade?.toLowerCase().includes(term) ||
        record.remarks?.toLowerCase().includes(term)
      )
    })
  }, [grades, typeFilter, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage)
  const paginatedGrades = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredGrades.slice(start, start + itemsPerPage)
  }, [filteredGrades, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  const handleTypeFilter = (type) => {
    setTypeFilter(type)
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
    mutationFn: (id) => api.delete(`/academic/grades/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['grades'])
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

  const getGradeBadge = (letterGrade) => {
    if (!letterGrade) return 'badge-primary'
    if (letterGrade.startsWith('A')) return 'badge-success'
    if (letterGrade.startsWith('B')) return 'badge-primary'
    if (letterGrade.startsWith('C')) return 'badge-warning'
    return 'badge-danger'
  }

  const getTypeBadge = (type) => {
    const badges = {
      quiz: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      midterm: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      final: 'bg-red-500/20 text-red-400 border-red-500/30',
      assignment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      project: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    }
    return badges[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
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
          <h1 className="text-2xl font-bold text-white">Grades</h1>
          <p className="text-slate-400 mt-1">Manage student grades and assessments</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => navigate('/assign-grade', { state: { from: '/dashboard/grades' } })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Grade
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/50 rounded-lg">
              <Award className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total Records</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{stats.quiz}</p>
              <p className="text-xs text-slate-400">Quizzes</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{stats.midterm}</p>
              <p className="text-xs text-slate-400">Midterms</p>
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ClipboardList className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.final}</p>
              <p className="text-xs text-slate-400">Finals</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.assignment}</p>
              <p className="text-xs text-slate-400">Assignments</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.project}</p>
              <p className="text-xs text-slate-400">Projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'all', label: 'All', count: stats.total },
          { key: 'quiz', label: 'Quiz', count: stats.quiz },
          { key: 'midterm', label: 'Midterm', count: stats.midterm },
          { key: 'final', label: 'Final', count: stats.final },
          { key: 'assignment', label: 'Assignment', count: stats.assignment },
          { key: 'project', label: 'Project', count: stats.project },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTypeFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              typeFilter === tab.key
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
            placeholder="Search by student, course, or assessment..."
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Assessment</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Grade</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Remarks</th>
                  {canEdit && (
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedGrades.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">
                      {formatDate(record.date_assessed)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{record.student_name}</p>
                      <p className="text-xs text-slate-400">{record.student_code}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{record.course_code}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]" title={record.course_name}>{record.course_name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white">{record.assessment_name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border capitalize ${getTypeBadge(record.assessment_type)}`}>
                        {record.assessment_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{record.score} / {record.max_score}</p>
                      {record.percentage && (
                        <p className="text-xs text-slate-400">{record.percentage.toFixed(1)}%</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {record.letter_grade ? (
                        <span className={`badge ${getGradeBadge(record.letter_grade)}`}>
                          {record.letter_grade}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {record.remarks ? (
                        <p className="text-slate-300 text-sm max-w-[200px] truncate" title={record.remarks}>{record.remarks}</p>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/edit-grade/${record.id}`)}
                            className="p-2 text-amber-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit grade"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(record.id)}
                            className="p-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Delete grade"
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
            {paginatedGrades.length === 0 && (
              <p className="text-center py-12 text-slate-400">
                {searchTerm || typeFilter !== 'all' ? 'No grades match your filters' : 'No grades found'}
              </p>
            )}

            {/* Pagination */}
            {filteredGrades.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredGrades.length)} of {filteredGrades.length} records
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
            <h3 className="text-xl font-bold text-white mb-4">Delete Grade Record</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this grade record? This action cannot be undone.
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
