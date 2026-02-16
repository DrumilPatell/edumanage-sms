import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { academicApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Plus, Search } from 'lucide-react'

export default function GradesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const canEdit = user?.role === 'admin' || user?.role === 'faculty'
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: () => academicApi.getGrades({ limit: 100 }),
  })

  const filteredGrades = grades.filter((grade) => {
    const term = searchTerm.toLowerCase()
    return (
      grade.assessment_name?.toLowerCase().includes(term) ||
      grade.assessment_type?.toLowerCase().includes(term) ||
      grade.letter_grade?.toLowerCase().includes(term) ||
      String(grade.student_id).toLowerCase().includes(term)
    )
  })

  const getGradeBadge = (percentage) => {
    if (percentage >= 90) return 'badge-success'
    if (percentage >= 80) return 'badge-primary'
    if (percentage >= 70) return 'badge-warning'
    return 'badge-danger'
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by assessment name, type, student ID, or grade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
        />
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Assessment</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Student ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Percentage</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => (
                  <tr key={grade.id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-white">{grade.assessment_name}</p>
                      {grade.date_assessed && (
                        <p className="text-sm text-slate-400">
                          {new Date(grade.date_assessed).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge-primary capitalize">{grade.assessment_type}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{grade.student_id}</td>
                    <td className="py-3 px-4 font-medium text-white">
                      {grade.score} / {grade.max_score}
                    </td>
                    <td className="py-3 px-4">
                      {grade.percentage && (
                        <span className={`badge ${getGradeBadge(grade.percentage)}`}>
                          {grade.percentage.toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {grade.letter_grade && (
                        <span className="font-semibold text-amber-400">{grade.letter_grade}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredGrades.length === 0 && (
              <p className="text-center py-12 text-slate-400">
                {searchTerm ? 'No grades match your search' : 'No grades found'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
