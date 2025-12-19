import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '../services/api'
import { Edit, Trash2, UserPlus, Mail, Phone } from 'lucide-react'

export default function StudentsPage() {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getStudents({ limit: 100 }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-slate-400 mt-1">Manage student profiles and academic information</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {students.map((student) => (
              <div key={student.id} className="card hover:shadow-2xl hover:shadow-amber-500/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <span className="text-lg font-semibold text-white">
                        {student.full_name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{student.full_name}</h3>
                      <p className="text-sm text-slate-400">{student.student_id}</p>
                    </div>
                  </div>
                  <span className={`badge ${student.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    {student.email}
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="w-4 h-4" />
                      {student.phone}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div>
                    <p className="text-xs text-slate-500">Program</p>
                    <p className="text-sm font-medium text-white">{student.program || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">GPA</p>
                    <p className="text-sm font-medium text-amber-400">
                      {student.gpa ? student.gpa.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {!isLoading && students.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-400">No students found</p>
        </div>
      )}
    </div>
  )
}
