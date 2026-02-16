import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { studentsApi } from '../services/api'
import { ArrowLeft, Save, User, Mail, Phone, Calendar, Hash, Building, GraduationCap, BookOpen, AlertCircle } from 'lucide-react'

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
    year_level: '',
    current_semester: '',
    gpa: '',
    gpa_scale: 'us'
  });

  const [errors, setErrors] = useState({})
  const [displayDOB, setDisplayDOB] = useState('')
  const [displayEnrollmentDate, setDisplayEnrollmentDate] = useState('')

  const formatDateToDisplay = (isoDate) => {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    return `${day}-${month}-${year}`
  }

  const formatDateToISO = (displayDate) => {
    if (!displayDate || displayDate.length !== 10) return ''
    const [day, month, year] = displayDate.split('-')
    return `${year}-${month}-${day}`
  }

  const validateYearLevel = (value) => {
    if (value === '' || value === null) return ''
    const num = parseInt(value)
    if (isNaN(num) || num < 1 || num > 5) {
      return 'Year level must be between 1 and 5'
    }
    return ''
  }

  const validateGPA = (value, scale) => {
    if (value === '' || value === null) return ''
    const num = parseFloat(value)
    const maxGPA = scale === 'us' ? 4.0 : 10.0
    if (isNaN(num) || num < 0 || num > maxGPA) {
      return `GPA must be between 0 and ${maxGPA}`
    }
    return ''
  }

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.getStudent(id),
  })

  useEffect(() => {
    if (student) {
      const gpaValue = student.gpa || 0
      const detectedScale = gpaValue > 4 ? 'indian' : 'us'
      
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
        year_level: student.year_level || '',
        current_semester: student.current_semester || '',
        gpa: student.gpa || '',
        gpa_scale: detectedScale
      })
      setDisplayDOB(formatDateToDisplay(student.date_of_birth || ''))
      setDisplayEnrollmentDate(formatDateToDisplay(student.enrollment_date || ''))
    }
  }, [student])

  const mutation = useMutation({
    mutationFn: (data) => studentsApi.updateStudent(id, data),
    onSuccess: () => {
      setTimeout(() => navigate('/dashboard'), 1500)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const yearError = formData.year_level ? validateYearLevel(formData.year_level) : ''
    const gpaError = formData.gpa ? validateGPA(formData.gpa, formData.gpa_scale) : ''
    
    if (yearError || gpaError) {
      setErrors({ year_level: yearError, gpa: gpaError })
      return
    }
    
    mutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    
    if (name === 'date_of_birth') {
      setFormData({
        ...formData,
        date_of_birth: value
      })
      setDisplayDOB(formatDateToDisplay(value))
    } else if (name === 'enrollment_date') {
      setFormData({
        ...formData,
        enrollment_date: value
      })
      setDisplayEnrollmentDate(formatDateToDisplay(value))
    } else if (name === 'year_level') {
      const error = validateYearLevel(value)
      setErrors(prev => ({ ...prev, year_level: error }))
      setFormData({
        ...formData,
        year_level: value
      })
    } else if (name === 'gpa') {
      const error = validateGPA(value, formData.gpa_scale)
      setErrors(prev => ({ ...prev, gpa: error }))
      setFormData({
        ...formData,
        gpa: value
      })
    } else if (name === 'gpa_scale') {
      const error = validateGPA(formData.gpa, value)
      setErrors(prev => ({ ...prev, gpa: error }))
      setFormData({
        ...formData,
        gpa_scale: value,
        gpa: ''
      })
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleDisplayDOBChange = (e) => {
    const value = e.target.value
    setDisplayDOB(value)
    if (value.length === 10) {
      setFormData({
        ...formData,
        date_of_birth: formatDateToISO(value)
      })
    }
  }

  const handleDisplayEnrollmentDateChange = (e) => {
    const value = e.target.value
    setDisplayEnrollmentDate(value)
    if (value.length === 10) {
      setFormData({
        ...formData,
        enrollment_date: formatDateToISO(value)
      })
    }
  }

  const getMaxGPA = () => formData.gpa_scale === 'us' ? 4.0 : 10.0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <button
        onClick={() => navigate('/dashboard/students')}
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Students</span>
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Student</h1>
              <p className="text-slate-400">Update student information</p>
            </div>
          </div>

          {mutation.isError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
              {mutation.error?.response?.data?.detail || 'Failed to update student'}
            </div>
          )}

          {mutation.isSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
              Student updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Student ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., STU001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="123-456-7890"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer hover:text-amber-400 transition-colors z-10" 
                    onClick={() => document.getElementById('date_of_birth_picker').showPicker()}
                  />
                  <input
                    type="date"
                    id="date_of_birth_picker"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="absolute left-0 top-0 w-11 h-full opacity-0 cursor-pointer z-20"
                    style={{ colorScheme: 'dark' }}
                  />
                  <input
                    type="text"
                    name="display_dob"
                    value={displayDOB}
                    onChange={handleDisplayDOBChange}
                    placeholder="dd-mm-yyyy"
                    maxLength="10"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    onInput={(e) => {
                      let value = e.target.value.replace(/[^\d]/g, '')
                      if (value.length >= 2) value = value.slice(0, 2) + '-' + value.slice(2)
                      if (value.length >= 5) value = value.slice(0, 5) + '-' + value.slice(5, 9)
                      e.target.value = value
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gender
                </label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enrollment Date
                </label>
                <div className="relative">
                  <Calendar 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer hover:text-amber-400 transition-colors z-10" 
                    onClick={() => document.getElementById('enrollment_date_picker').showPicker()}
                  />
                  <input
                    type="date"
                    id="enrollment_date_picker"
                    name="enrollment_date"
                    value={formData.enrollment_date}
                    onChange={handleChange}
                    className="absolute left-0 top-0 w-11 h-full opacity-0 cursor-pointer z-20"
                    style={{ colorScheme: 'dark' }}
                    required
                  />
                  <input
                    type="text"
                    name="display_enrollment_date"
                    value={displayEnrollmentDate}
                    onChange={handleDisplayEnrollmentDateChange}
                    placeholder="dd-mm-yyyy"
                    maxLength="10"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    onInput={(e) => {
                      let value = e.target.value.replace(/[^\d]/g, '')
                      if (value.length >= 2) value = value.slice(0, 2) + '-' + value.slice(2)
                      if (value.length >= 5) value = value.slice(0, 5) + '-' + value.slice(5, 9)
                      e.target.value = value
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Program
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year Level (1-5)
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    name="year_level"
                    value={formData.year_level}
                    onChange={handleChange}
                    min="1"
                    max="5"
                    placeholder="Enter year (1-5)"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${errors.year_level ? 'border-red-500' : 'border-slate-600'}`}
                  />
                </div>
                {errors.year_level && (
                  <p className="text-red-400 text-sm mt-1">{errors.year_level}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Semester
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="current_semester"
                    value={formData.current_semester}
                    onChange={handleChange}
                    placeholder="e.g., Fall 2024, Spring 2025"
                    className={`w-full pl-11 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${errors.current_semester ? 'border-red-500' : 'border-slate-600'}`}
                  />
                </div>
                {errors.current_semester && (
                  <p className="text-red-400 text-sm mt-1">{errors.current_semester}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GPA Scale
                </label>
                <div className="relative">
                  <select
                    name="gpa_scale"
                    value={formData.gpa_scale}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="us">US System (0 - 4.0)</option>
                    <option value="indian">Indian System (0 - 10.0)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GPA (0 - {getMaxGPA()})
                </label>
                <input
                  type="number"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max={getMaxGPA()}
                  placeholder={`Enter GPA (0 - ${getMaxGPA()})`}
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${errors.gpa ? 'border-red-500' : 'border-slate-600'}`}
                />
                {errors.gpa && (
                  <p className="text-red-400 text-sm mt-1">{errors.gpa}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Address
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder="Enter full address"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending || errors.year_level || errors.gpa}
                className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
