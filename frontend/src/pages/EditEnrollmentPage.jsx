import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { enrollmentsApi, studentsApi, coursesApi } from '../services/api'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditEnrollmentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active'
  })

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: async () => {
      const enrollments = await enrollmentsApi.getEnrollments({ limit: 1000 })
      return enrollments.find(e => e.id === parseInt(id))
    },
  })

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getStudents({ limit: 100 }),
  })

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses({ limit: 100 }),
  })

  useEffect(() => {
    if (enrollment) {
      setFormData({
        student_id: enrollment.student_id || '',
        course_id: enrollment.course_id || '',
        enrollment_date: enrollment.enrollment_date || new Date().toISOString().split('T')[0],
        status: enrollment.status || 'active'
      })
    }
  }, [enrollment])

  const mutation = useMutation({
    mutationFn: (data) => enrollmentsApi.updateEnrollment(id, data),
    onSuccess: () => {
      setTimeout(() => navigate('/dashboard/enrollments'), 1500)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'student_id' || name === 'course_id' ? parseInt(value, 10) : value
    }))
  }

  if (enrollmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/enrollments')}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Enrollment</h1>
          <p className="text-slate-400 mt-1">Update enrollment information</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="student_id" className="block text-sm font-medium text-slate-300 mb-2">
              Student
            </label>
            <select
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} ({student.student_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="course_id" className="block text-sm font-medium text-slate-300 mb-2">
              Course
            </label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="enrollment_date" className="block text-sm font-medium text-slate-300 mb-2">
              Enrollment Date
            </label>
            <input
              type="date"
              id="enrollment_date"
              name="enrollment_date"
              value={formData.enrollment_date}
              onChange={handleChange}
              className="input-field"
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          {mutation.isError && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">
                {mutation.error?.response?.data?.detail || 'Failed to update enrollment'}
              </p>
            </div>
          )}

          {mutation.isSuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">Enrollment updated successfully! Redirecting...</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/enrollments')}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
