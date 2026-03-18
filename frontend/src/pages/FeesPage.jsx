import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DollarSign, Plus, Receipt, CreditCard, Trash2, Edit, X } from 'lucide-react'
import { feesApi, studentsApi } from '../services/api'

const getToday = () => new Date().toISOString().split('T')[0]

const getDefaultDueDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 15)
  return date.toISOString().split('T')[0]
}

const emptyItem = { fee_head_id: '', description: '', amount: '' }

export default function FeesPage() {
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('invoices')

  const [showFeeHeadModal, setShowFeeHeadModal] = useState(false)
  const [editingFeeHead, setEditingFeeHead] = useState(null)
  const [feeHeadForm, setFeeHeadForm] = useState({
    code: '',
    name: '',
    description: '',
    default_amount: '',
    is_recurring: true,
    is_active: true,
  })

  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({
    student_id: '',
    issue_date: getToday(),
    due_date: getDefaultDueDate(),
    discount_amount: '0',
    late_fee_amount: '0',
    notes: '',
    items: [{ ...emptyItem }],
  })

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    payment_date: getToday(),
    amount: '',
    mode: 'cash',
    reference_no: '',
    notes: '',
  })

  const { data: summary } = useQuery({
    queryKey: ['fees-summary'],
    queryFn: () => feesApi.getSummary(),
  })

  const { data: feeHeads = [], isLoading: loadingFeeHeads } = useQuery({
    queryKey: ['fee-heads'],
    queryFn: () => feesApi.getFeeHeads({ include_inactive: true }),
  })

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['fee-invoices'],
    queryFn: () => feesApi.getInvoices({ limit: 300 }),
  })

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['fee-payments'],
    queryFn: () => feesApi.getPayments({ limit: 300 }),
  })

  const { data: students = [] } = useQuery({
    queryKey: ['students-for-fees'],
    queryFn: () => studentsApi.getStudents({ limit: 1000 }),
  })

  const openCreateFeeHead = () => {
    setEditingFeeHead(null)
    setFeeHeadForm({
      code: '',
      name: '',
      description: '',
      default_amount: '',
      is_recurring: true,
      is_active: true,
    })
    setShowFeeHeadModal(true)
  }

  const openEditFeeHead = (head) => {
    setEditingFeeHead(head)
    setFeeHeadForm({
      code: head.code || '',
      name: head.name || '',
      description: head.description || '',
      default_amount: String(head.default_amount ?? ''),
      is_recurring: !!head.is_recurring,
      is_active: !!head.is_active,
    })
    setShowFeeHeadModal(true)
  }

  const unpaidInvoices = useMemo(
    () => invoices.filter((invoice) => Number(invoice.balance_amount) > 0),
    [invoices]
  )

  const createFeeHeadMutation = useMutation({
    mutationFn: (payload) => feesApi.createFeeHead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-heads'])
      setShowFeeHeadModal(false)
    },
  })

  const updateFeeHeadMutation = useMutation({
    mutationFn: ({ id, payload }) => feesApi.updateFeeHead(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-heads'])
      setShowFeeHeadModal(false)
    },
  })

  const deleteFeeHeadMutation = useMutation({
    mutationFn: (id) => feesApi.deleteFeeHead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-heads'])
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: (payload) => feesApi.createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-invoices'])
      queryClient.invalidateQueries(['fees-summary'])
      setShowInvoiceModal(false)
      setInvoiceForm({
        student_id: '',
        issue_date: getToday(),
        due_date: getDefaultDueDate(),
        discount_amount: '0',
        late_fee_amount: '0',
        notes: '',
        items: [{ ...emptyItem }],
      })
    },
  })

  const createPaymentMutation = useMutation({
    mutationFn: (payload) => feesApi.createPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['fee-invoices'])
      queryClient.invalidateQueries(['fee-payments'])
      queryClient.invalidateQueries(['fees-summary'])
      setShowPaymentModal(false)
      setPaymentForm({
        invoice_id: '',
        payment_date: getToday(),
        amount: '',
        mode: 'cash',
        reference_no: '',
        notes: '',
      })
    },
  })

  const formatCurrency = (value) => {
    const amount = Number(value || 0)
    return `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusBadge = (status) => {
    const classes = {
      paid: 'badge-success',
      partial: 'badge-warning',
      issued: 'badge-primary',
      overdue: 'badge-danger',
      cancelled: 'badge-danger',
    }
    return classes[status] || 'badge-primary'
  }

  const submitFeeHead = (e) => {
    e.preventDefault()
    const payload = {
      ...feeHeadForm,
      default_amount: Number(feeHeadForm.default_amount || 0),
    }

    if (editingFeeHead) {
      updateFeeHeadMutation.mutate({ id: editingFeeHead.id, payload })
      return
    }

    createFeeHeadMutation.mutate(payload)
  }

  const handleInvoiceItemChange = (index, key, value) => {
    setInvoiceForm((prev) => {
      const nextItems = [...prev.items]
      const row = { ...nextItems[index], [key]: value }

      if (key === 'fee_head_id') {
        const selectedHead = feeHeads.find((head) => String(head.id) === String(value))
        if (selectedHead) {
          if (!row.description) {
            row.description = selectedHead.name
          }
          if (!row.amount || Number(row.amount) === 0) {
            row.amount = String(selectedHead.default_amount || '')
          }
        }
      }

      nextItems[index] = row
      return { ...prev, items: nextItems }
    })
  }

  const addInvoiceItem = () => {
    setInvoiceForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }))
  }

  const removeInvoiceItem = (index) => {
    setInvoiceForm((prev) => {
      if (prev.items.length === 1) return prev
      const nextItems = prev.items.filter((_, i) => i !== index)
      return { ...prev, items: nextItems }
    })
  }

  const submitInvoice = (e) => {
    e.preventDefault()

    const cleanedItems = invoiceForm.items
      .map((item) => ({
        fee_head_id: item.fee_head_id ? Number(item.fee_head_id) : null,
        description: (item.description || '').trim(),
        amount: Number(item.amount || 0),
      }))
      .filter((item) => item.description && item.amount > 0)

    if (!invoiceForm.student_id || cleanedItems.length === 0) {
      return
    }

    createInvoiceMutation.mutate({
      student_id: Number(invoiceForm.student_id),
      issue_date: invoiceForm.issue_date,
      due_date: invoiceForm.due_date,
      discount_amount: Number(invoiceForm.discount_amount || 0),
      late_fee_amount: Number(invoiceForm.late_fee_amount || 0),
      notes: invoiceForm.notes?.trim() || null,
      items: cleanedItems,
    })
  }

  const openCollectPayment = (invoice) => {
    setPaymentForm({
      invoice_id: String(invoice.id),
      payment_date: getToday(),
      amount: String(invoice.balance_amount),
      mode: 'cash',
      reference_no: '',
      notes: '',
    })
    setShowPaymentModal(true)
  }

  const submitPayment = (e) => {
    e.preventDefault()
    if (!paymentForm.invoice_id || Number(paymentForm.amount) <= 0) {
      return
    }

    createPaymentMutation.mutate({
      invoice_id: Number(paymentForm.invoice_id),
      payment_date: paymentForm.payment_date,
      amount: Number(paymentForm.amount),
      mode: paymentForm.mode,
      reference_no: paymentForm.reference_no?.trim() || null,
      notes: paymentForm.notes?.trim() || null,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fee Management</h1>
          <p className="text-slate-400 mt-1">Manage fee heads, invoices and collections.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCreateFeeHead} className="btn-secondary">
            <Plus className="w-4 h-4 mr-2" />
            Fee Head
          </button>
          <button onClick={() => setShowInvoiceModal(true)} className="btn-primary">
            <Receipt className="w-4 h-4 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card py-4">
          <p className="text-xs text-slate-400">Total Invoiced</p>
          <p className="text-2xl font-bold text-white mt-1">{formatCurrency(summary?.total_invoiced)}</p>
        </div>
        <div className="card py-4">
          <p className="text-xs text-slate-400">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(summary?.total_collected)}</p>
        </div>
        <div className="card py-4">
          <p className="text-xs text-slate-400">Outstanding</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(summary?.total_outstanding)}</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-700/50 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'invoices' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'payments' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab('heads')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'heads' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          Fee Heads
        </button>
      </div>

      {activeTab === 'invoices' && (
        <div className="card">
          {loadingInvoices ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700/50">
                  <tr>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Invoice</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Student</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Due Date</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Total</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Balance</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-700/30 hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <p className="font-medium text-white">{invoice.invoice_no}</p>
                        <p className="text-xs text-slate-400">{new Date(invoice.issue_date).toLocaleDateString('en-GB')}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-white">{invoice.student_name}</p>
                        <p className="text-xs text-slate-400">{invoice.student_code}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{new Date(invoice.due_date).toLocaleDateString('en-GB')}</td>
                      <td className="py-3 px-3 text-slate-300">{formatCurrency(invoice.total_amount)}</td>
                      <td className="py-3 px-3 text-amber-300">{formatCurrency(invoice.balance_amount)}</td>
                      <td className="py-3 px-3">
                        <span className={`badge ${getStatusBadge(invoice.status)}`}>{invoice.status}</span>
                      </td>
                      <td className="py-3 px-3">
                        {Number(invoice.balance_amount) > 0 ? (
                          <button onClick={() => openCollectPayment(invoice)} className="btn-secondary text-xs py-1.5 px-2.5">
                            <CreditCard className="w-3.5 h-3.5 mr-1" />
                            Collect
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">No action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <p className="text-center py-10 text-slate-400">No invoices yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card">
          {loadingPayments ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700/50">
                  <tr>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Payment</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Invoice</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Student</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Mode</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-700/30 hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <p className="font-medium text-white">{payment.payment_no}</p>
                        <p className="text-xs text-slate-400">{new Date(payment.payment_date).toLocaleDateString('en-GB')}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{payment.invoice_no}</td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-white">{payment.student_name}</p>
                        <p className="text-xs text-slate-400">{payment.student_code}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-300 uppercase">{payment.mode.replace('_', ' ')}</td>
                      <td className="py-3 px-3 text-emerald-400">{formatCurrency(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payments.length === 0 && (
                <p className="text-center py-10 text-slate-400">No payments collected yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'heads' && (
        <div className="card">
          {loadingFeeHeads ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700/50">
                  <tr>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Code</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Name</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Default Amount</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Type</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-3 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feeHeads.map((head) => (
                    <tr key={head.id} className="border-b border-slate-700/30 hover:bg-slate-800/40">
                      <td className="py-3 px-3 text-amber-300 font-medium">{head.code}</td>
                      <td className="py-3 px-3 text-white">{head.name}</td>
                      <td className="py-3 px-3 text-slate-300">{formatCurrency(head.default_amount)}</td>
                      <td className="py-3 px-3 text-slate-300">{head.is_recurring ? 'Recurring' : 'One-time'}</td>
                      <td className="py-3 px-3">
                        <span className={`badge ${head.is_active ? 'badge-success' : 'badge-warning'}`}>
                          {head.is_active ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEditFeeHead(head)} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFeeHeadMutation.mutate(head.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {feeHeads.length === 0 && (
                <p className="text-center py-10 text-slate-400">No fee heads added yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {showFeeHeadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={submitFeeHead} className="w-full max-w-xl bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editingFeeHead ? 'Edit Fee Head' : 'Create Fee Head'}</h3>
              <button type="button" onClick={() => setShowFeeHeadModal(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input className="input-field" placeholder="Code (e.g. TUITION)" value={feeHeadForm.code} onChange={(e) => setFeeHeadForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} required />
              <input className="input-field" placeholder="Name" value={feeHeadForm.name} onChange={(e) => setFeeHeadForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>

            <input className="input-field" placeholder="Default Amount" type="number" min="0" step="0.01" value={feeHeadForm.default_amount} onChange={(e) => setFeeHeadForm((p) => ({ ...p, default_amount: e.target.value }))} required />
            <textarea className="input-field h-24" placeholder="Description (optional)" value={feeHeadForm.description} onChange={(e) => setFeeHeadForm((p) => ({ ...p, description: e.target.value }))} />

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-slate-300 text-sm">
                <input type="checkbox" checked={feeHeadForm.is_recurring} onChange={(e) => setFeeHeadForm((p) => ({ ...p, is_recurring: e.target.checked }))} />
                Recurring fee
              </label>
              <label className="flex items-center gap-2 text-slate-300 text-sm">
                <input type="checkbox" checked={feeHeadForm.is_active} onChange={(e) => setFeeHeadForm((p) => ({ ...p, is_active: e.target.checked }))} />
                Active
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowFeeHeadModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={createFeeHeadMutation.isPending || updateFeeHeadMutation.isPending}>
                {createFeeHeadMutation.isPending || updateFeeHeadMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={submitInvoice} className="w-full max-w-4xl bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Create Invoice</h3>
              <button type="button" onClick={() => setShowInvoiceModal(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <select className="input-field" value={invoiceForm.student_id} onChange={(e) => setInvoiceForm((p) => ({ ...p, student_id: e.target.value }))} required>
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.student_id} - {student.full_name}</option>
                ))}
              </select>
              <input className="input-field" type="date" value={invoiceForm.issue_date} onChange={(e) => setInvoiceForm((p) => ({ ...p, issue_date: e.target.value }))} required />
              <input className="input-field" type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm((p) => ({ ...p, due_date: e.target.value }))} required />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input className="input-field" type="number" min="0" step="0.01" value={invoiceForm.discount_amount} onChange={(e) => setInvoiceForm((p) => ({ ...p, discount_amount: e.target.value }))} placeholder="Discount amount" />
              <input className="input-field" type="number" min="0" step="0.01" value={invoiceForm.late_fee_amount} onChange={(e) => setInvoiceForm((p) => ({ ...p, late_fee_amount: e.target.value }))} placeholder="Late fee amount" />
            </div>

            <textarea className="input-field h-20" value={invoiceForm.notes} onChange={(e) => setInvoiceForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes (optional)" />

            <div className="border border-slate-700 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white">Invoice Items</h4>
                <button type="button" className="btn-secondary" onClick={addInvoiceItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>

              {invoiceForm.items.map((item, index) => (
                <div key={index} className="grid md:grid-cols-12 gap-2 items-center">
                  <select
                    className="input-field md:col-span-3"
                    value={item.fee_head_id}
                    onChange={(e) => handleInvoiceItemChange(index, 'fee_head_id', e.target.value)}
                  >
                    <option value="">Fee Head (optional)</option>
                    {feeHeads.filter((h) => h.is_active).map((head) => (
                      <option key={head.id} value={head.id}>{head.code}</option>
                    ))}
                  </select>
                  <input
                    className="input-field md:col-span-6"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleInvoiceItemChange(index, 'description', e.target.value)}
                    required
                  />
                  <input
                    className="input-field md:col-span-2"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => handleInvoiceItemChange(index, 'amount', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeInvoiceItem(index)}
                    className="md:col-span-1 p-3 text-red-400 hover:bg-red-500/10 rounded-lg"
                    disabled={invoiceForm.items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowInvoiceModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={createInvoiceMutation.isPending}>
                {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={submitPayment} className="w-full max-w-xl bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Collect Payment</h3>
              <button type="button" onClick={() => setShowPaymentModal(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <select
              className="input-field"
              value={paymentForm.invoice_id}
              onChange={(e) => {
                const selectedInvoice = unpaidInvoices.find((invoice) => String(invoice.id) === e.target.value)
                setPaymentForm((prev) => ({
                  ...prev,
                  invoice_id: e.target.value,
                  amount: selectedInvoice ? String(selectedInvoice.balance_amount) : prev.amount,
                }))
              }}
              required
            >
              <option value="">Select Invoice</option>
              {unpaidInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_no} - {invoice.student_code} ({formatCurrency(invoice.balance_amount)})
                </option>
              ))}
            </select>

            <div className="grid sm:grid-cols-2 gap-3">
              <input className="input-field" type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm((p) => ({ ...p, payment_date: e.target.value }))} required />
              <input className="input-field" type="number" min="0.01" step="0.01" placeholder="Amount" value={paymentForm.amount} onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <select className="input-field" value={paymentForm.mode} onChange={(e) => setPaymentForm((p) => ({ ...p, mode: e.target.value }))}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online</option>
              </select>
              <input className="input-field" placeholder="Reference No (optional)" value={paymentForm.reference_no} onChange={(e) => setPaymentForm((p) => ({ ...p, reference_no: e.target.value }))} />
            </div>

            <textarea className="input-field h-20" placeholder="Notes (optional)" value={paymentForm.notes} onChange={(e) => setPaymentForm((p) => ({ ...p, notes: e.target.value }))} />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={createPaymentMutation.isPending}>
                {createPaymentMutation.isPending ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {(createFeeHeadMutation.error || updateFeeHeadMutation.error || createInvoiceMutation.error || createPaymentMutation.error || deleteFeeHeadMutation.error) && (
        <div className="card border-red-500/40 bg-red-500/10 text-red-300 text-sm">
          {createFeeHeadMutation.error?.response?.data?.detail ||
            updateFeeHeadMutation.error?.response?.data?.detail ||
            createInvoiceMutation.error?.response?.data?.detail ||
            createPaymentMutation.error?.response?.data?.detail ||
            deleteFeeHeadMutation.error?.response?.data?.detail ||
            'Something went wrong while saving fee data.'}
        </div>
      )}
    </div>
  )
}
