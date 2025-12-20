import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { studentsApi } from '../services/api'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditStudentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    enrollment_date: '',
    program: '',
    year_level: 1,
    gpa: 0.0,
    is_active: true
  })

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.getStudent(id),
  })

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id || '',
        full_name: student.full_name || '',
        email: student.email || '',
        phone: student.phone || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        address: student.address || '',
        enrollment_date: student.enrollment_date || '',
        program: student.program || '',
        year_level: student.year_level || 1,
        gpa: student.gpa || 0.0,
        is_active: student.is_active !== undefined ? student.is_active : true
      })
    }
  }, [student])

  const mutation = useMutation({
    mutationFn: (data) => studentsApi.updateStudent(id, data),
    onSuccess: () => {
      setTimeout(() => navigate('/dashboard/students'), 1500)
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
              type === 'number' ? parseFloat(value) || 0 :
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
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/students')}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Student</h1>
          <p className="text-slate-400 mt-1">Update student information</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-slate-300 mb-2">
                Student ID
              </label>
              <input
                type="text"
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-slate-300 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="input-field w-full"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-300 mb-2">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="enrollment_date" className="block text-sm font-medium text-slate-300 mb-2">
                Enrollment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="enrollment_date"
                  name="enrollment_date"
                  value={formData.enrollment_date}
                  onChange={handleChange}
                  className="input-field w-full"
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="program" className="block text-sm font-medium text-slate-300 mb-2">
                Program
              </label>
              <input
                type="text"
                id="program"
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label htmlFor="year_level" className="block text-sm font-medium text-slate-300 mb-2">
                Year Level
              </label>
              <input
                type="number"
                id="year_level"
                name="year_level"
                value={formData.year_level}
                onChange={handleChange}
                className="input-field"
                min="1"
                max="6"
              />
            </div>

            <div>
              <label htmlFor="gpa" className="block text-sm font-medium text-slate-300 mb-2">
                GPA
              </label>
              <input
                type="number"
                id="gpa"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                className="input-field"
                step="0.01"
                min="0"
                max="4"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field resize-none overflow-hidden"
              rows="3"
              placeholder="Enter full address"
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
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
              Active Student
            </label>
          </div>

          {mutation.isError && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">
                {mutation.error?.response?.data?.detail || 'Failed to update student'}
              </p>
            </div>
          )}

          {mutation.isSuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">Student updated successfully! Redirecting...</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/students')}
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
