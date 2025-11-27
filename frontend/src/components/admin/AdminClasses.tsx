import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import AdminCourses from './AdminCourses'
import * as monthSvc from '../../services/monthService'

type Batch = {
  _id?: string
  year: string
  title?: string
  description?: string
  status?: string
}

export default function AdminClasses() {
  const [activeTab, setActiveTab] = useState<'batches' | 'courses'>('batches')
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [current, setCurrent] = useState<Batch | null>(null)
  const [form, setForm] = useState<Partial<Batch>>({ year: '' })
  const [monthsOpenFor, setMonthsOpenFor] = useState<Batch | null>(null)
  const [months, setMonths] = useState<any[]>([])
  const [monthModalOpen, setMonthModalOpen] = useState(false)
  const [monthForm, setMonthForm] = useState<any>({ name: '', title: '', description: '' })
  const [editingMonth, setEditingMonth] = useState<any | null>(null)

  useEffect(() => {
    load()
    const onUpdated = () => load()
    window.addEventListener('batches-updated', onUpdated)
    return () => window.removeEventListener('batches-updated', onUpdated)
  }, [])

  async function load() {
    setLoading(true)
    try {
      const svc = await import('../../services/batchService')
      const res = await svc.getBatches()
      setBatches(res || [])
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to load batches')
    } finally {
      setLoading(false)
    }
  }

  async function loadMonthsFor(batch?: Batch) {
    if (!batch) return setMonths([])
    try {
      const res = await monthSvc.getMonths(batch.year)
      setMonths(res.months || [])
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to load months')
    }
  }

  function openNew() {
    setCurrent(null)
    setForm({ year: '' })
    setModalOpen(true)
  }

  function openEdit(b: Batch) {
    setCurrent(b)
    setForm({ year: b.year, title: b.title, description: b.description, status: b.status })
    setModalOpen(true)
  }

  function openView(b: Batch) {
    setCurrent(b)
    setViewOpen(true)
  }

  function openManageMonths(b: Batch) {
    setMonthsOpenFor(b)
    setMonthForm({ name: '', title: '', description: '', price: 0, currency: 'LKR' })
    setEditingMonth(null)
    setMonthModalOpen(true)
    loadMonthsFor(b)
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    try {
      const svc = await import('../../services/batchService')
      if (current && current._id) {
        await svc.updateBatch(current._id, form)
        toast.success('Batch updated')
      } else {
          // createBatch expects a full payload with required fields; assert here because the form input is required in the UI
          await svc.createBatch(form as any)
        toast.success('Batch created')
      }
      setModalOpen(false)
      window.dispatchEvent(new CustomEvent('batches-updated'))
      load()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to save batch')
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return
    if (!confirm('Delete this batch?')) return
    try {
      const svc = await import('../../services/batchService')
      await svc.deleteBatch(id)
      toast.success('Batch deleted')
      window.dispatchEvent(new CustomEvent('batches-updated'))
      load()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to delete')
    }
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-4 py-3 font-semibold transition ${
            activeTab === 'batches'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Batches
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-3 font-semibold transition ${
            activeTab === 'courses'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Courses
        </button>
      </div>

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Batches</h1>
              <p className="text-gray-600">Create and manage year batches (e.g., 2026, 2027)</p>
            </div>
            <button onClick={openNew} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
              <PlusIcon className="w-5 h-5" />
              <span>New Batch</span>
            </button>
          </div>

          {loading && <div className="mb-4 text-sm text-gray-600">Loading batches...</div>}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Year</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-sm text-gray-600">No batches found</td>
                    </tr>
                  ) : (
                    batches.map((b, index) => (
                      <motion.tr key={b._id || index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{b.year}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700">{b.title || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ (b.status || 'Active') === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{b.status || 'Active'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => openView(b)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition" title="View">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEdit(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <EditIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => openManageMonths(b)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Manage Months">M</button>
                            <button onClick={() => handleDelete(b._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create / Edit Modal */}
          <AnimatePresence>
            {modalOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">{current ? 'Edit Batch' : 'Create Batch'}</h2>
                    <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                  </div>
                  <form onSubmit={submit} className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                      <input required value={form.year || ''} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2026" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Optional title" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Optional description" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                      <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition">{current ? 'Save Changes' : 'Create Batch'}</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Modal */}
          <AnimatePresence>
            {viewOpen && current && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setViewOpen(false)}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Batch {current.year}</h2>
                    <button onClick={() => setViewOpen(false)} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="text-gray-900">{current.title || '-'}</p>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-900">{current.description || '-'}</p>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-gray-900">{current.status || 'Active'}</p>
                    <div className="flex gap-3 pt-4">
                      <button onClick={() => { setViewOpen(false); openEdit(current); }} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold">Edit</button>
                      <button onClick={() => setViewOpen(false)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg">Close</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Months Modal (cards UI) */}
          <AnimatePresence>
            {monthModalOpen && monthsOpenFor && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setMonthModalOpen(false)}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Months for {monthsOpenFor.year}</h2>
                    <button onClick={() => setMonthModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XIcon className="w-6 h-6" /></button>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-600">Create, view, edit, delete months for this batch. Months appear as cards below.</div>
                      <div className="flex items-center space-x-2">
                        <input value={monthForm.name || ''} onChange={(e) => setMonthForm({ ...monthForm, name: e.target.value })} placeholder="Month name e.g., January" className="p-2 border rounded" />
                        <input type="number" value={monthForm.price ?? 0} onChange={(e) => setMonthForm({ ...monthForm, price: Number(e.target.value) })} placeholder="Amount LKR (0 = Free)" className="p-2 border rounded ml-2 w-44" />
                        <button onClick={async () => {
                          try {
                            if (!monthForm.name) return toast.error('Enter month name')
                            if (editingMonth && editingMonth._id) {
                              await monthSvc.updateMonth(editingMonth._id, { ...monthForm, batchYear: monthsOpenFor.year })
                              toast.success('Month updated')
                            } else {
                              await monthSvc.createMonth({ ...monthForm, batchYear: monthsOpenFor.year })
                              toast.success('Month created')
                            }
                            setMonthForm({ name: '', title: '', description: '' })
                            setEditingMonth(null)
                            const res = await monthSvc.getMonths(monthsOpenFor.year)
                            setMonths(res.months || [])
                            window.dispatchEvent(new CustomEvent('months-updated'))
                          } catch (err: any) {
                            console.error(err)
                            toast.error('Failed to save month')
                          }
                        }} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded">{editingMonth ? 'Save' : 'Add Month'}</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {months.map((m) => (
                        <div key={m._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-lg font-semibold">{m.name}</div>
                              <div className="text-sm text-gray-600">{m.title || ''}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button onClick={() => { setEditingMonth(m); setMonthForm({ name: m.name, title: m.title, description: m.description, price: m.price || 0, currency: m.currency || 'LKR' }); }} className="text-blue-600">Edit</button>
                              <button onClick={async () => { if (!confirm('Delete this month?')) return; try { await monthSvc.deleteMonth(m._id); toast.success('Deleted'); const res = await monthSvc.getMonths(monthsOpenFor.year); setMonths(res.months || []); window.dispatchEvent(new CustomEvent('months-updated')); } catch (err) { toast.error('Failed to delete') } }} className="text-red-600">Delete</button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 mt-3">{m.description}</div>
                          <div className="text-sm text-gray-900 font-semibold mt-3">{(m.price && m.price > 0) ? `LKR ${m.price}` : 'Free'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && <AdminCourses />}
    </div>
  )
}
