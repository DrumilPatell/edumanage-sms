import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, DollarSign, User, BookOpen, FileText, AlertCircle } from 'lucide-react'
import { feesApi, studentsApi } from '../services/api'

const todayDate = () => new Date().toISOString().split('T')[0]

const defaultForm = {
  student_id: '',
  course_id: '',
  issue_date: todayDate(),
  due_date: todayDate(),
  fee_amount: '',
  late_fee_amount: '0',
  notes: '',
}

export default function CreateFeeRecordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const editRecord = location.state?.record || null

  const issueDateRef = useRef(null)
  const dueDateRef = useRef(null)

  const [form, setForm] = useState(() => {
    if (!editRecord) return defaultForm
    return {
      student_id: String(editRecord.student_id),
      course_id: String(editRecord.course_id),
      issue_date: editRecord.issue_date,
      due_date: editRecord.due_date,
      fee_amount: String(editRecord.fee_amount),
      late_fee_amount: String(editRecord.late_fee_amount),
      notes: editRecord.notes || '',
    }
  })

  const { data: students = [] } = useQuery({
    queryKey: ['fee-students'],
    queryFn: () => studentsApi.getStudents({ limit: 1000 }),
  })

  const { data: studentCourses = [] } = useQuery({
    queryKey: ['fee-student-courses', form.student_id],
    queryFn: () => feesApi.getStudentCourses(form.student_id),
    enabled: !!form.student_id,
  })

  const createMutation = useMutation({
    mutationFn: (payload) => feesApi.createRecord(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-records'])
      queryClient.invalidateQueries(['fee-summary'])
      navigate('/dashboard/fees')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => feesApi.updateRecord(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-records'])
      queryClient.invalidateQueries(['fee-summary'])
      navigate('/dashboard/fees')
    },
  })

  const openPicker = (inputRef) => {
    if (!inputRef?.current) return
    if (typeof inputRef.current.showPicker === 'function') {
      inputRef.current.showPicker()
      return
    }
    inputRef.current.focus()
  }

  const onStudentChange = (value) => {
    setForm((prev) => ({ ...prev, student_id: value, course_id: '' }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    const payload = {
      student_id: Number(form.student_id),
      course_id: Number(form.course_id),
      issue_date: form.issue_date,
      due_date: form.due_date,
      fee_amount: Number(form.fee_amount),
      late_fee_amount: Number(form.late_fee_amount || 0),
      notes: form.notes?.trim() || null,
    }

    if (editRecord) {
      updateMutation.mutate({ id: editRecord.id, payload })
      return
    }

    createMutation.mutate(payload)
  }

  const mutationError =
    createMutation.error?.response?.data?.detail ||
    updateMutation.error?.response?.data?.detail ||
    null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <button
        onClick={() => navigate('/dashboard/fees')}
        className="fixed top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Fees</span>
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{editRecord ? 'Edit Fee Record' : 'Create Fee Record'}</h1>
              <p className="text-slate-400">Select student and enter fee details</p>
            </div>
          </div>

          {mutationError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {mutationError}
            </div>
          )}

          {(createMutation.isSuccess || updateMutation.isSuccess) && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
              Fee record {editRecord ? 'updated' : 'created'} successfully!
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Student</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  className="w-full pl-11 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
                  value={form.student_id}
                  onChange={(e) => onStudentChange(e.target.value)}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.student_id} - {student.full_name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Course (Enrolled by Student)</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  className="w-full pl-11 pr-10 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  value={form.course_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, course_id: e.target.value }))}
                  required
                  disabled={!form.student_id}
                >
                  <option value="">Select Course</option>
                  {studentCourses.map((course) => (
                    <option key={course.course_id} value={course.course_id}>{course.course_code} - {course.course_name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Issue Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    ref={issueDateRef}
                    type="date"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={form.issue_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, issue_date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    ref={dueDateRef}
                    type="date"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={form.due_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Course Fee Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter fee amount"
                    value={form.fee_amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, fee_amount: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Late Fee Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter late fee"
                    value={form.late_fee_amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, late_fee_amount: e.target.value }))}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Applied only after due date if unpaid</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <textarea
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder="Optional notes for this fee record"
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editRecord ? 'Update Fee Record' : 'Create Fee Record'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
