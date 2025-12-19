import { useQuery } from '@tanstack/react-query'
import { coursesApi } from '../services/api'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses({ limit: 100 }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-slate-400 mt-1">Manage course catalog and assignments</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {courses.map((course) => (
              <div key={course.id} className="card hover:shadow-2xl hover:shadow-amber-500/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{course.course_name}</h3>
                    <p className="text-sm text-amber-400">{course.course_code}</p>
                  </div>
                  <span className={`badge ${course.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {course.description && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Credits</p>
                    <p className="text-sm font-medium text-white">{course.credits}</p>
                  </div>
                  {course.semester && (
                    <div>
                      <p className="text-xs text-slate-500">Semester</p>
                      <p className="text-sm font-medium text-white">{course.semester}</p>
                    </div>
                  )}
                  {course.faculty_name && (
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">Faculty</p>
                      <p className="text-sm font-medium text-white truncate">{course.faculty_name}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
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

      {!isLoading && courses.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-400">No courses found</p>
        </div>
      )}
    </div>
  )
}
