import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Edit, Plus, Trash2, Wallet, X } from 'lucide-react'
import { feesApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

const todayDate = () => new Date().toISOString().split('T')[0]

export default function FeesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const normalizedRole = typeof user?.role === 'string'
    ? user.role.toLowerCase().replace('roleenum.', '')
    : ''
  const isAdmin = normalizedRole === 'admin'
  const isStudent = normalizedRole === 'student'

  const [paymentModal, setPaymentModal] = useState({ open: false, record: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, record: null })
  const [paymentForm, setPaymentForm] = useState({
    payment_date: todayDate(),
    amount: '',
    mode: 'cash',
    reference_no: '',
    notes: '',
  })

  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['fee-records'],
    queryFn: () => feesApi.getRecords({ limit: 500 }),
    enabled: isAdmin,
  })

  const { data: summary } = useQuery({
    queryKey: ['fee-summary'],
    queryFn: () => feesApi.getSummary(),
    enabled: isAdmin,
  })

  const { data: studentDashboard } = useQuery({
    queryKey: ['student-fee-records'],
    queryFn: () => feesApi.getMyRecords(),
    enabled: isStudent,
  })

  const paymentMutation = useMutation({
    mutationFn: ({ id, payload }) => feesApi.addPayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-records'])
      queryClient.invalidateQueries(['fee-summary'])
      queryClient.invalidateQueries(['student-fee-records'])
      setPaymentModal({ open: false, record: null })
      setPaymentForm({
        payment_date: todayDate(),
        amount: '',
        mode: 'cash',
        reference_no: '',
        notes: '',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => feesApi.deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-records'])
      queryClient.invalidateQueries(['fee-summary'])
      setDeleteModal({ open: false, record: null })
    },
  })

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const statusBadge = (status) => {
    const map = {
      pending: 'badge-primary',
      partial: 'badge-warning',
      paid: 'badge-success',
      overdue: 'badge-danger',
    }
    return map[status] || 'badge-primary'
  }

  const onEditRecord = (record) => {
    navigate('/create-fee-record', { state: { record } })
  }

  const openPaymentModal = (record) => {
    setPaymentModal({ open: true, record })
    setPaymentForm((prev) => ({ ...prev, amount: String(record.balance_amount) }))
  }

  const submitPayment = (e) => {
    e.preventDefault()
    if (!paymentModal.record) return

    paymentMutation.mutate({
      id: paymentModal.record.id,
      payload: {
        payment_date: paymentForm.payment_date,
        amount: Number(paymentForm.amount),
        mode: paymentForm.mode,
        reference_no: paymentForm.reference_no?.trim() || null,
        notes: paymentForm.notes?.trim() || null,
      },
    })
  }

  if (isStudent) {
    const studentRecords = studentDashboard?.records || []
    const studentSummary = studentDashboard?.summary

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Fees</h1>
          <p className="text-slate-400 mt-1">You can view fees only for courses in which you are enrolled.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card py-4">
            <p className="text-xs text-slate-400">Total Assigned</p>
            <p className="text-2xl font-bold text-white mt-1">{formatCurrency(studentSummary?.total_fee_assigned)}</p>
          </div>
          <div className="card py-4">
            <p className="text-xs text-slate-400">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(studentSummary?.total_collected)}</p>
          </div>
          <div className="card py-4">
            <p className="text-xs text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(studentSummary?.total_outstanding)}</p>
          </div>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Course</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Issue Date</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Due Date</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Total</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {studentRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/30">
                    <td className="py-3 px-3">
                      <p className="font-medium text-white">{record.course_name}</p>
                      <p className="text-xs text-slate-400">{record.course_code}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{new Date(record.issue_date).toLocaleDateString('en-GB')}</td>
                    <td className="py-3 px-3 text-slate-300">{new Date(record.due_date).toLocaleDateString('en-GB')}</td>
                    <td className="py-3 px-3 text-slate-300">{formatCurrency(record.total_amount)}</td>
                    <td className="py-3 px-3">
                      <span className={`badge ${statusBadge(record.status)}`}>{record.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {studentRecords.length === 0 && (
              <p className="text-center py-10 text-slate-400">No fee records found for your enrolled courses.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fee Management</h1>
          <p className="text-slate-400 mt-1">Assign and track course-wise fees for students.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/create-fee-record')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Fee Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card py-4">
          <p className="text-xs text-slate-400">Total Assigned</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(summary?.total_fee_assigned)}</p>
        </div>
        <div className="card py-4">
          <p className="text-xs text-slate-400">Collected</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(summary?.total_collected)}</p>
        </div>
        <div className="card py-4">
          <p className="text-xs text-slate-400">Outstanding</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(summary?.total_outstanding)}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Fee Records</h3>
        {loadingRecords ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700/50">
                <tr>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Student</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Course</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Due Date</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Total</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Balance</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-3 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/30">
                    <td className="py-3 px-3">
                      <p className="font-medium text-white">{record.student_name}</p>
                      <p className="text-xs text-slate-400">{record.student_code}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-white">{record.course_name}</p>
                      <p className="text-xs text-slate-400">{record.course_code}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{new Date(record.due_date).toLocaleDateString('en-GB')}</td>
                    <td className="py-3 px-3 text-slate-300">{formatCurrency(record.total_amount)}</td>
                    <td className="py-3 px-3 text-amber-300">{formatCurrency(record.balance_amount)}</td>
                    <td className="py-3 px-3">
                      <span className={`badge ${statusBadge(record.status)}`}>{record.status}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEditRecord(record)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg" title="Edit fee">
                          <Edit className="w-4 h-4" />
                        </button>
                        {Number(record.balance_amount) > 0 && (
                          <button onClick={() => openPaymentModal(record)} className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg" title="Add payment">
                            <Wallet className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal({ open: true, record })}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          title="Delete fee record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && <p className="text-center py-10 text-slate-400">No fee records created yet.</p>}
          </div>
        )}
      </div>

      {paymentModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={submitPayment} className="w-full max-w-lg bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Add Payment</h3>
              <button type="button" onClick={() => setPaymentModal({ open: false, record: null })} className="p-2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-700/40 border border-slate-600/60 rounded-lg p-3 text-sm">
              <p className="text-slate-300">Student: <span className="text-white font-medium">{paymentModal.record?.student_name}</span></p>
              <p className="text-slate-300">Course: <span className="text-white font-medium">{paymentModal.record?.course_code}</span></p>
              <p className="text-slate-300">Current Balance: <span className="text-amber-300 font-medium">{formatCurrency(paymentModal.record?.balance_amount)}</span></p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment Date</label>
                <input className="input-field" type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm((prev) => ({ ...prev, payment_date: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Amount</label>
                <input className="input-field" type="number" min="0.01" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))} required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment Mode</label>
                <select className="input-field" value={paymentForm.mode} onChange={(e) => setPaymentForm((prev) => ({ ...prev, mode: e.target.value }))}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Reference No (Optional)</label>
                <input className="input-field" value={paymentForm.reference_no} onChange={(e) => setPaymentForm((prev) => ({ ...prev, reference_no: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Notes (Optional)</label>
              <textarea className="input-field h-20" value={paymentForm.notes} onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setPaymentModal({ open: false, record: null })} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={paymentMutation.isPending}>
                <CreditCard className="w-4 h-4 mr-1" />
                {paymentMutation.isPending ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-800/95 backdrop-blur rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <h3 className="text-xl font-bold text-white">Delete Fee Record</h3>
              <button type="button" onClick={() => setDeleteModal({ open: false, record: null })} className="btn-secondary !p-2">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-slate-300">Are you sure you want to delete the fee record for:</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Student</label>
                  <div className="input-field bg-slate-700/40 cursor-default">
                    {deleteModal.record?.student_name}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Course</label>
                  <div className="input-field bg-slate-700/40 cursor-default">
                    {deleteModal.record?.course_code}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Amount</label>
                  <div className="input-field bg-slate-700/40 cursor-default text-amber-300">
                    {formatCurrency(deleteModal.record?.total_amount)}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                  <div className="input-field bg-slate-700/40 cursor-default">
                    <span className={`badge ${statusBadge(deleteModal.record?.status)}`}>{deleteModal.record?.status}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm">⚠️ This will permanently delete this fee record and all associated payments. This action cannot be undone.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-slate-700/50">
              <button type="button" onClick={() => setDeleteModal({ open: false, record: null })} className="btn-secondary">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteModal.record?.id)}
                className="btn-primary !bg-red-600 hover:!bg-red-700"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(paymentMutation.error || deleteMutation.error) && (
        <div className="card border-red-500/40 bg-red-500/10 text-red-300 text-sm">
          {paymentMutation.error?.response?.data?.detail ||
            deleteMutation.error?.response?.data?.detail ||
            'Something went wrong while saving fee details.'}
        </div>
      )}
    </div>
  )
}
