import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { coursesApi } from '../services/api'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditCoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    description: '',
    credits: 3,
    semester: '',
    is_active: true
  })

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => coursesApi.getCourse(id),
  })

  useEffect(() => {
    if (course) {
      setFormData({
        course_code: course.course_code || '',
        course_name: course.course_name || '',
        description: course.description || '',
        credits: course.credits || 3,
        semester: course.semester || '',
        is_active: course.is_active !== undefined ? course.is_active : true
      })
    }
  }, [course])

  const mutation = useMutation({
    mutationFn: (data) => coursesApi.updateCourse(id, data),
    onSuccess: () => {
      setTimeout(() => navigate('/dashboard/courses'), 1500)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseInt(value, 10) || 0 :
              value
    }))
  }

  if (isLoading) {
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
          onClick={() => navigate('/dashboard/courses')}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Course</h1>
          <p className="text-slate-400 mt-1">Update course information</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="course_code" className="block text-sm font-medium text-slate-300 mb-2">
              Course Code
            </label>
            <input
              type="text"
              id="course_code"
              name="course_code"
              value={formData.course_code}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., CS101"
              required
            />
          </div>

          <div>
            <label htmlFor="course_name" className="block text-sm font-medium text-slate-300 mb-2">
              Course Name
            </label>
            <input
              type="text"
              id="course_name"
              name="course_name"
              value={formData.course_name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Introduction to Programming"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Course description..."
            />
          </div>

          <div>
            <label htmlFor="credits" className="block text-sm font-medium text-slate-300 mb-2">
              Credit Hours
            </label>
            <input
              type="number"
              id="credits"
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              className="input-field"
              min="1"
              max="10"
              required
            />
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-slate-300 mb-2">
              Semester
            </label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select Semester</option>
              <option value="Fall 2024">Fall 2024</option>
              <option value="Spring 2025">Spring 2025</option>
              <option value="Summer 2025">Summer 2025</option>
              <option value="Fall 2025">Fall 2025</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-300">
              Active Course
            </label>
          </div>

          {mutation.isError && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">
                {mutation.error?.response?.data?.detail || 'Failed to update course'}
              </p>
            </div>
          )}

          {mutation.isSuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">Course updated successfully! Redirecting...</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/courses')}
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
