import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { academicApi, studentsApi, coursesApi, enrollmentsApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { Plus, ChevronLeft, ChevronRight, Users, BookOpen, Check, X, Clock, AlertCircle, Trash2 } from 'lucide-react'
import api from '../lib/api'

export default function AttendancePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const canEdit = user?.role === 'admin' || user?.role === 'faculty'
  
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingDate, setEditingDate] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [editForm, setEditForm] = useState({ status: 'present', notes: '' })
  
  // Fetch all data
  const { data: attendance = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => academicApi.getAttendance({ limit: 500 }),
    staleTime: 30000,
  })

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getAll({ limit: 100 }),
  })

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll({ limit: 100 }),
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => enrollmentsApi.getAll({ limit: 1000 }),
  })

  // Get students enrolled in selected course
  const enrolledStudents = useMemo(() => {
    if (!selectedCourseId) return []
    const courseEnrollments = enrollments.filter(e => e.course_id === selectedCourseId)
    return courseEnrollments.map(e => ({
      id: e.student_id,
      name: e.student_name,
      code: e.student_code,
      enrollmentDate: e.enrollment_date
    }))
  }, [selectedCourseId, enrollments])

  // Get enrollment date for selected student in selected course
  const selectedEnrollmentDate = useMemo(() => {
    if (!selectedCourseId || !selectedStudentId) return null
    const enrollment = enrollments.find(
      e => e.course_id === selectedCourseId && e.student_id === selectedStudentId
    )
    return enrollment?.enrollment_date ? new Date(enrollment.enrollment_date) : null
  }, [selectedCourseId, selectedStudentId, enrollments])

  // Navigate to enrollment month when student is selected
  useEffect(() => {
    if (selectedEnrollmentDate) {
      setCurrentDate(new Date(selectedEnrollmentDate.getFullYear(), selectedEnrollmentDate.getMonth(), 1))
    }
  }, [selectedEnrollmentDate])

  // Reset student when course changes
  useEffect(() => {
    setSelectedStudentId(null)
  }, [selectedCourseId])

  // Filter attendance for selected course and student
  const filteredAttendance = useMemo(() => {
    if (!selectedCourseId || !selectedStudentId) return []
    return attendance.filter(
      a => a.course_id === selectedCourseId && a.student_id === selectedStudentId
    )
  }, [attendance, selectedCourseId, selectedStudentId])

  // Create attendance map for quick lookup
  const attendanceMap = useMemo(() => {
    const map = {}
    filteredAttendance.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0]
      map[dateKey] = record
    })
    return map
  }, [filteredAttendance])

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredAttendance.length
    const present = filteredAttendance.filter(a => a.status === 'present').length
    const absent = filteredAttendance.filter(a => a.status === 'absent').length
    const late = filteredAttendance.filter(a => a.status === 'late').length
    const excused = filteredAttendance.filter(a => a.status === 'excused').length
    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0
    return { total, present, absent, late, excused, percentage }
  }, [filteredAttendance])

  // Overall stats
  const overallStats = useMemo(() => {
    const total = attendance.length
    const present = attendance.filter(r => r.status === 'present').length
    const absent = attendance.filter(r => r.status === 'absent').length
    const late = attendance.filter(r => r.status === 'late').length
    const excused = attendance.filter(r => r.status === 'excused').length
    return { total, present, absent, late, excused }
  }, [attendance])

  // Calendar helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPrevMonth = () => {
    if (selectedEnrollmentDate) {
      const prevMonth = new Date(year, month - 1, 1)
      const enrollmentMonth = new Date(selectedEnrollmentDate.getFullYear(), selectedEnrollmentDate.getMonth(), 1)
      if (prevMonth < enrollmentMonth) return
    }
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    if (selectedEnrollmentDate && today < selectedEnrollmentDate) {
      setCurrentDate(new Date(selectedEnrollmentDate.getFullYear(), selectedEnrollmentDate.getMonth(), 1))
    } else {
      setCurrentDate(today)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <Check className="w-3 h-3 text-green-400" />
      case 'absent':
        return <X className="w-3 h-3 text-red-400" />
      case 'late':
        return <Clock className="w-3 h-3 text-yellow-400" />
      case 'excused':
        return <AlertCircle className="w-3 h-3 text-blue-400" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'absent': return 'bg-red-500/20 border-red-500/50 text-red-400'
      case 'late': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'excused': return 'bg-blue-500/20 border-blue-500/50 text-blue-400'
      default: return ''
    }
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = []
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, attendance: null, isBeforeEnrollment: false })
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const currentDayDate = new Date(year, month, day)
      
      let isBeforeEnrollment = false
      if (selectedEnrollmentDate) {
        const enrollmentDateOnly = new Date(selectedEnrollmentDate)
        enrollmentDateOnly.setHours(0, 0, 0, 0)
        const compareDate = new Date(currentDayDate)
        compareDate.setHours(0, 0, 0, 0)
        isBeforeEnrollment = compareDate < enrollmentDateOnly
      }
      
      const today = new Date()
      const isFuture = currentDayDate > today
      
      days.push({
        day,
        dateKey,
        attendance: attendanceMap[dateKey] || null,
        isToday: new Date().toISOString().split('T')[0] === dateKey,
        isBeforeEnrollment,
        isFuture
      })
    }
    
    return days
  }, [year, month, daysInMonth, firstDayOfMonth, attendanceMap, selectedEnrollmentDate])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/academic/attendance/', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance'])
      setShowEditModal(false)
      setEditingDate(null)
      setEditingRecord(null)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/academic/attendance/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance'])
      setShowEditModal(false)
      setEditingDate(null)
      setEditingRecord(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/academic/attendance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance'])
      setShowEditModal(false)
      setEditingDate(null)
      setEditingRecord(null)
    }
  })

  const handleDayClick = (item) => {
    if (!canEdit || item.isBeforeEnrollment || item.isFuture || !item.day) return
    
    setEditingDate(item.dateKey)
    setEditingRecord(item.attendance)
    setEditForm({
      status: item.attendance?.status || 'present',
      notes: item.attendance?.notes || ''
    })
    setShowEditModal(true)
  }

  const handleSave = () => {
    if (editingRecord) {
      // Update existing
      updateMutation.mutate({
        id: editingRecord.id,
        data: {
          status: editForm.status,
          notes: editForm.notes,
          student_id: selectedStudentId,
          course_id: selectedCourseId,
          date: editingDate
        }
      })
    } else {
      // Create new
      createMutation.mutate({
        student_id: selectedStudentId,
        course_id: selectedCourseId,
        date: editingDate,
        status: editForm.status,
        notes: editForm.notes
      })
    }
  }

  const handleDelete = () => {
    if (editingRecord) {
      deleteMutation.mutate(editingRecord.id)
    }
  }

  const isLoading = loadingAttendance || loadingStudents || loadingCourses

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 mt-1">Select a course and student to view/edit attendance</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => navigate('/mark-attendance', { state: { from: '/dashboard/attendance' } })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Bulk Mark
          </button>
        )}
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700/50 rounded-lg">
              <Users className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{overallStats.total}</p>
              <p className="text-xs text-slate-400">Total Records</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xl font-bold text-emerald-400">{overallStats.present}</p>
              <p className="text-xs text-slate-400">Present</p>
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-400" />
            <div>
              <p className="text-xl font-bold text-red-400">{overallStats.absent}</p>
              <p className="text-xs text-slate-400">Absent</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xl font-bold text-amber-400">{overallStats.late}</p>
              <p className="text-xs text-slate-400">Late</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-xl font-bold text-blue-400">{overallStats.excused}</p>
              <p className="text-xs text-slate-400">Excused</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-slate-300 mb-3">1. Select Course</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((course) => {
            const courseAttendance = attendance.filter(a => a.course_id === course.id)
            const coursePresent = courseAttendance.filter(a => a.status === 'present' || a.status === 'late').length
            const courseTotal = courseAttendance.length
            const studentsInCourse = enrollments.filter(e => e.course_id === course.id).length
            
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  selectedCourseId === course.id
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      selectedCourseId === course.id ? 'bg-amber-500/20' : 'bg-slate-700/50'
                    }`}>
                      <BookOpen className={`w-4 h-4 ${
                        selectedCourseId === course.id ? 'text-amber-400' : 'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${
                        selectedCourseId === course.id ? 'text-amber-400' : 'text-white'
                      }`}>{course.course_name}</p>
                      <p className="text-xs text-slate-400">{course.course_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{studentsInCourse} students</p>
                    <p className="text-xs text-slate-500">{courseTotal} records</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {courses.length === 0 && (
          <p className="text-slate-400 text-center py-4">No courses found</p>
        )}
      </div>

      {/* Student Selector - Only show when course is selected */}
      {selectedCourseId && (
        <div className="card">
          <label className="block text-sm font-medium text-slate-300 mb-3">2. Select Student</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {enrolledStudents.map((student) => {
              const studentAttendance = attendance.filter(
                a => a.course_id === selectedCourseId && a.student_id === student.id
              )
              const studentPresent = studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length
              const studentTotal = studentAttendance.length
              const studentPercentage = studentTotal > 0 ? ((studentPresent / studentTotal) * 100).toFixed(0) : 0
              
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    selectedStudentId === student.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium text-sm ${
                        selectedStudentId === student.id ? 'text-amber-400' : 'text-white'
                      }`}>{student.name}</p>
                      <p className="text-xs text-slate-400">{student.code}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        studentPercentage >= 75 ? 'text-green-400' : studentPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>{studentPercentage}%</p>
                      <p className="text-xs text-slate-400">{studentTotal} classes</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {enrolledStudents.length === 0 && (
            <p className="text-slate-400 text-center py-4">No students enrolled in this course</p>
          )}
        </div>
      )}

      {/* Calendar View - Only show when course and student are selected */}
      {selectedCourseId && selectedStudentId && (
        <>
          {/* Stats for selected student */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="card bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 py-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{stats.percentage}%</p>
                <p className="text-xs text-amber-200/70">Attendance</p>
              </div>
            </div>
            <div className="card py-3">
              <div className="text-center">
                <p className="text-xl font-bold text-green-400">{stats.present}</p>
                <p className="text-xs text-slate-400">Present</p>
              </div>
            </div>
            <div className="card py-3">
              <div className="text-center">
                <p className="text-xl font-bold text-red-400">{stats.absent}</p>
                <p className="text-xs text-slate-400">Absent</p>
              </div>
            </div>
            <div className="card py-3">
              <div className="text-center">
                <p className="text-xl font-bold text-yellow-400">{stats.late}</p>
                <p className="text-xs text-slate-400">Late</p>
              </div>
            </div>
            <div className="card py-3">
              <div className="text-center">
                <p className="text-xl font-bold text-blue-400">{stats.excused}</p>
                <p className="text-xs text-slate-400">Excused</p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="card py-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  {monthNames[month]} {year}
                </h3>
                {selectedEnrollmentDate && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enrolled: {selectedEnrollmentDate.toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-2.5 py-1 text-xs sm:text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={goToPrevMonth}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleDayClick(item)}
                  className={`h-12 sm:h-14 md:h-16 p-1 rounded flex flex-col items-center justify-center relative ${
                    item.day === null 
                      ? 'bg-transparent' 
                      : item.isBeforeEnrollment || item.isFuture
                        ? 'bg-slate-900/50 border border-slate-800/50 opacity-40'
                        : item.attendance 
                          ? `${getStatusColor(item.attendance.status)} ${canEdit ? 'cursor-pointer hover:opacity-80' : ''}`
                          : item.isToday
                            ? `bg-slate-700/50 border border-amber-500/50 ${canEdit ? 'cursor-pointer hover:bg-slate-700' : ''}`
                            : `bg-slate-800/30 border border-slate-700/30 ${canEdit ? 'cursor-pointer hover:bg-slate-700/50' : ''}`
                  }`}
                >
                  {item.day && (
                    <>
                      <span className={`text-xs sm:text-sm font-medium ${
                        item.isBeforeEnrollment || item.isFuture
                          ? 'text-slate-600 line-through' 
                          : item.attendance 
                            ? '' 
                            : item.isToday 
                              ? 'text-amber-400' 
                              : 'text-slate-300'
                      }`}>
                        {item.day}
                      </span>
                      {item.attendance && !item.isBeforeEnrollment && (
                        <div className="mt-0">
                          {getStatusIcon(item.attendance.status)}
                        </div>
                      )}
                      {canEdit && !item.isBeforeEnrollment && !item.isFuture && !item.attendance && (
                        <Plus className="w-3 h-3 text-slate-500 mt-0 opacity-50" />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <Check className="w-2 h-2 text-green-400" />
                </div>
                <span className="text-xs text-slate-400">Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                  <X className="w-2 h-2 text-red-400" />
                </div>
                <span className="text-xs text-slate-400">Absent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                  <Clock className="w-2 h-2 text-yellow-400" />
                </div>
                <span className="text-xs text-slate-400">Late</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                  <AlertCircle className="w-2 h-2 text-blue-400" />
                </div>
                <span className="text-xs text-slate-400">Excused</span>
              </div>
              {canEdit && (
                <span className="text-xs text-slate-500">| Click to edit</span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!selectedCourseId && (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Select a Course</h3>
            <p className="text-slate-400 max-w-md">
              Choose a course above to view enrolled students and their attendance calendar.
            </p>
          </div>
        </div>
      )}

      {selectedCourseId && !selectedStudentId && enrolledStudents.length > 0 && (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Select a Student</h3>
            <p className="text-slate-400 max-w-md">
              Choose a student above to view and edit their attendance calendar.
            </p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingRecord ? 'Edit Attendance' : 'Mark Attendance'}
            </h3>
            <p className="text-slate-400 mb-4">
              Date: {new Date(editingDate).toLocaleDateString('en-GB', { 
                weekday: 'long',
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
            
            {/* Status Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {['present', 'absent', 'late', 'excused'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setEditForm(prev => ({ ...prev, status }))}
                    className={`p-3 rounded-lg border-2 transition-all capitalize flex items-center justify-center gap-2 ${
                      editForm.status === status
                        ? status === 'present' ? 'border-green-500 bg-green-500/20 text-green-400'
                        : status === 'absent' ? 'border-red-500 bg-red-500/20 text-red-400'
                        : status === 'late' ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                        : 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {status === 'present' && <Check className="w-4 h-4" />}
                    {status === 'absent' && <X className="w-4 h-4" />}
                    {status === 'late' && <Clock className="w-4 h-4" />}
                    {status === 'excused' && <AlertCircle className="w-4 h-4" />}
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes (Optional)</label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingDate(null)
                  setEditingRecord(null)
                }}
                className="flex-1 py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              {editingRecord && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
