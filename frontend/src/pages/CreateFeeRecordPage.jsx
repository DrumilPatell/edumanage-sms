import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronDown, Save, X } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{editRecord ? 'Edit Fee Record' : 'Create Fee Record'}</h1>
            <p className="text-slate-400 mt-1">
              Select student first, then choose from enrolled courses and enter fee details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/fees')}
            className="btn-secondary"
          >
            <X className="w-4 h-4 mr-1" />
            Back
          </button>
        </div>

        <div className="card">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Student</label>
                <div className="relative">
                  <select
                    className="input-field appearance-none pr-10"
                    value={form.student_id}
                    onChange={(e) => onStudentChange(e.target.value)}
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>{student.student_id} - {student.full_name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Course (Enrolled by Student)</label>
                <div className="relative">
                  <select
                    className="input-field appearance-none pr-10"
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
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Issue Date</label>
                <div className="relative">
                  <input
                    ref={issueDateRef}
                    className="input-field pl-10"
                    type="date"
                    value={form.issue_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, issue_date: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => openPicker(issueDateRef)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                    aria-label="Open issue date picker"
                  >
                    <CalendarDays className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date</label>
                <div className="relative">
                  <input
                    ref={dueDateRef}
                    className="input-field pl-10"
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => openPicker(dueDateRef)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                    aria-label="Open due date picker"
                  >
                    <CalendarDays className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Course Fee Amount</label>
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter fee amount"
                  value={form.fee_amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, fee_amount: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Late Fee Amount</label>
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter late fee amount"
                  value={form.late_fee_amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, late_fee_amount: e.target.value }))}
                />
                <p className="text-xs text-slate-500 mt-1">Late fee will be applied only after due date if the fee is unpaid.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Notes</label>
              <textarea
                className="input-field h-24"
                placeholder="Optional notes for this fee record"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="w-4 h-4 mr-1" />
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editRecord ? 'Update Fee' : 'Create Fee'}
              </button>
            </div>
          </form>
        </div>

        {mutationError && (
          <div className="card border-red-500/40 bg-red-500/10 text-red-300 text-sm">
            {mutationError}
          </div>
        )}
      </div>
    </div>
  )
}
