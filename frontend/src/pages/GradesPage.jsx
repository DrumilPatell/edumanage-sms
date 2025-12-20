import { useQuery } from '@tanstack/react-query'
import { academicApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Plus } from 'lucide-react'

export default function GradesPage() {
  const { user } = useAuthStore()
  const canEdit = user?.role === 'admin' || user?.role === 'faculty'
  
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: () => academicApi.getGrades({ limit: 100 }),
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
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Grade
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Assessment</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Student ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Percentage</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-300">Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
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
            {grades.length === 0 && (
              <p className="text-center py-12 text-slate-400">No grades found</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
