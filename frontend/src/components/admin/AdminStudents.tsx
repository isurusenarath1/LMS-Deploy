import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, MailIcon, PhoneIcon, TrendingUpIcon, EditIcon, TrashIcon, PlusIcon, XIcon, EyeIcon } from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { toast } from 'sonner';
import adminService, { StudentPayload } from '../../services/adminService';
export default function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });
  const [submittingStudent, setSubmittingStudent] = useState(false);
  const firstStudentInputRef = useRef<HTMLInputElement | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const filteredStudents = students.filter(student => {
    const idStr = (student._id || student.id || '').toString();
    const matchesSearch = (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (student.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || idStr.toLowerCase().includes(searchQuery.toLowerCase());
    const status = student.status || 'Active';
    const matchesStatus = filterStatus === 'all' || status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [stats, setStats] = useState({ total: 0, active: 0, avgScore: 0, newThisMonth: 0 });
  const [imageErrorIds, setImageErrorIds] = useState<Record<string, boolean>>({});

  function getImageUrl(path?: string) {
    if (!path) return null;
    const s = String(path);
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    if (s.startsWith('/')) return `${window.location.origin}${s}`;
    // otherwise assume relative to uploads or already full
    return s;
  }

  function markImageError(id: string) {
    setImageErrorIds(prev => ({ ...prev, [id]: true }));
  }

  // compute stats whenever students change
  useEffect(() => {
    const total = students.length;
    const active = students.filter(s => (s.status || 'Active') === 'Active').length;
    const avgScoreArr = students.map(s => Number(s.avgScore || 0)).filter(n => !isNaN(n) && n > 0);
    const avgScore = avgScoreArr.length ? Math.round(avgScoreArr.reduce((a,b) => a+b,0)/avgScoreArr.length) : 0;
    const now = new Date();
    const newThisMonth = students.filter(s => s.createdAt && new Date(s.createdAt).getMonth() === now.getMonth() && new Date(s.createdAt).getFullYear() === now.getFullYear()).length;
    // set into local state by updating a small stats object (we'll track via local state variables)
    setStats({ total, active, avgScore, newThisMonth });
  }, [students]);

  function openAdd() {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', password: '', address: '' });
    setShowAddModal(true);
  }

  function closeModal() {
    setShowAddModal(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', password: '', address: '' });
  }

  useEffect(() => {
    if (showAddModal && firstStudentInputRef.current) firstStudentInputRef.current.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    if (showAddModal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAddModal]);

  async function loadStudents() {
    setLoading(true);
    try {
      const result = await adminService.getStudents();
      if (result && result.success) {
        setStudents(result.students || []);
      } else {
        toast.error(result.message || 'Failed to load students');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading students');
    } finally {
      setLoading(false);
    }
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!editingId && !formData.password)) {
      toast.error('Please fill in required fields');
      return;
    }

    const payload: StudentPayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address
    };
    if (!editingId) payload.password = formData.password;

    (async () => {
      try {
        if (editingId) {
          const res = await adminService.updateStudent(editingId, payload);
          if (res.success) {
            toast.success('Student updated');
            setShowAddModal(false);
            setEditingId(null);
            setFormData({ name: '', email: '', phone: '', password: '', address: '' });
            loadStudents();
          } else {
            toast.error(res.message || 'Failed to update');
          }
        } else {
          setSubmittingStudent(true);
          const res = await adminService.createStudent(payload);
          if (res.success) {
            toast.success('Student added successfully!');
            setShowAddModal(false);
            setFormData({ name: '', email: '', phone: '', password: '', address: '' });
            loadStudents();
          } else {
            toast.error(res.message || 'Failed to create student');
          }
          setSubmittingStudent(false);
        }
      } catch (err: any) {
        toast.error(err.message || 'Error saving student');
        setSubmittingStudent(false);
      }
    })();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const res = await adminService.deleteStudent(id);
      if (res.success) {
        toast.success('Student deleted');
        loadStudents();
      } else {
        toast.error(res.message || 'Failed to delete student');
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete error');
    }
  };

  const handleVerifyStudent = async (student: any) => {
    if (!confirm('Verify this student identity? This will mark ID verified.')) return;
    try {
      const res = await adminService.verifyStudent({ id: student._id });
      if (res && res.success) {
        toast.success('Student verified');
        loadStudents();
      } else {
        toast.error(res.message || 'Failed to verify');
      }
    } catch (err: any) {
      toast.error(err.message || 'Verify error');
    }
  };

  const handleToggleStatus = async (student: any) => {
    const newStatus = (student.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
    if (!confirm(`Change status to ${newStatus}?`)) return;
    try {
      const res = await adminService.updateStudent(student._id, { status: newStatus } as any);
      if (res && res.success) {
        toast.success('Status updated');
        loadStudents();
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Status update error');
    }
  };

  const openEdit = (student: any) => {
    setEditingId(student._id || student.id);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      password: '',
      address: student.address || ''
    });
    setShowAddModal(true);
  };

  const openView = (student: any) => {
    setSelectedStudent(student);
  };

  const closeView = () => {
    setSelectedStudent(null);
  };
  return <div>
  <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Management
          </h1>
          <p className="text-gray-600">
            Manage and monitor student information
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
          <PlusIcon className="w-5 h-5" />
          <span>Add Student</span>
        </button>
      </div>
      {loading && <div className="mb-4 text-sm text-gray-600">Loading students...</div>}
      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <motion.div initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.9,
          opacity: 0
        }} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Student' : 'Add New Student'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input ref={firstStudentInputRef} type="text" value={formData.name} onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })} placeholder="Enter student name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input type="email" value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} placeholder="student@example.com" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} placeholder="+94 71 234 5678" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingId ? 'Password (leave blank to keep)' : 'Password *'}
                  </label>
                  <input type="password" value={formData.password} onChange={e => setFormData({
                ...formData,
                password: e.target.value
              })} placeholder={editingId ? 'Leave blank to keep current password' : 'Enter password'} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...(!editingId ? { required: true } : {})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea value={formData.address} onChange={e => setFormData({
                ...formData,
                address: e.target.value
              })} placeholder="Enter student address" rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingStudent} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
                    {submittingStudent ? (<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>) : null}
                    {editingId ? (submittingStudent ? 'Saving...' : 'Save Changes') : (submittingStudent ? 'Adding...' : 'Add Student')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-gray-600 text-sm mb-1">Total Students</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-gray-600 text-sm mb-1">Active Students</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-gray-600 text-sm mb-1">Average Score</p>
          <p className="text-3xl font-bold text-blue-600">{stats.avgScore}%</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-xl shadow-md">
          <p className="text-gray-600 text-sm mb-1">New This Month</p>
          <p className="text-3xl font-bold text-purple-600">{stats.newThisMonth}</p>
        </motion.div>
      </div>
      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search by name, email, or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Student ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Months
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Avg Score
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student, index) => <motion.tr key={student._id || student.id || index} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.05
            }} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900">
                      {student.studentId || (student._id ? String(student._id).slice(-6) : student.id)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const imgSrc = getImageUrl(student.profilePicture);
                        const id = student._id || student.id || String(index);
                        if (imgSrc && !imageErrorIds[id]) {
                          return <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src={imgSrc} alt={student.name || 'avatar'} className="w-full h-full object-cover object-center" onError={() => markImageError(id)} />
                          </div>;
                        }
                        return <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {(student.name && student.name.length > 0) ? student.name.charAt(0) : '?'}
                        </div>;
                      })()}
                      <span className="font-medium text-gray-900">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <MailIcon className="w-4 h-4 mr-2" />
                        {student.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {student.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* quick preview button to load months into modal */}
                    <button onClick={async () => {
                      try {
                        const id = student._id || student.id;
                        const res = await adminService.getStudentMonths(id);

                        // normalize months from several possible shapes:
                        // - { success: true, months: [...] }
                        // - { months: [...] }
                        // - { data: { months: [...] } }
                        // - direct array [...]
                        let months: any[] = [];
                        if (Array.isArray(res)) months = res;
                        else if (res && Array.isArray(res.months)) months = res.months;
                        else if (res && res.data && Array.isArray(res.data.months)) months = res.data.months;
                        else if (res && Array.isArray(res.data)) months = res.data;

                        if (res && (res.success || months.length >= 0)) {
                          // always open the modal with normalized months
                          openView({ ...student, months });
                        } else {
                          toast.error(res?.message || 'Failed to load months');
                        }
                      } catch (e: any) {
                        console.error('Error fetching student months', e);
                        toast.error(e?.message || 'Error loading months');
                      }
                    }} className="ml-3 text-sm text-blue-600 hover:underline">Preview</button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {student.avgScore || 0}%
                      </span>
                      <TrendingUpIcon className="w-4 h-4 text-green-600" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ (student.status || 'Active') === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {student.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openEdit(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => openView(student)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition" title="View">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {!student.idVerified && <button onClick={() => handleVerifyStudent(student)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title="Verify">
                        <PlusIcon className="w-4 h-4" />
                      </button>}
                      <IconButton size="small" onClick={() => handleToggleStatus(student)} title="Toggle Status" className="text-gray-700">
                        {((student.status || 'Active') === 'Active') ? <CheckCircleIcon fontSize="small" className="text-green-600" /> : <BlockIcon fontSize="small" className="text-gray-600" />}
                      </IconButton>
                      <button onClick={() => handleDelete(student._id || student.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {/* View Student Modal */}
      <AnimatePresence>
        {selectedStudent && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeView}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Student Details</h2>
                <button onClick={closeView} className="text-gray-400 hover:text-gray-600">
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                    {(() => {
                      const imgSrc = getImageUrl(selectedStudent.profilePicture);
                      const sid = selectedStudent._id || selectedStudent.id || 'modal';
                      if (imgSrc && !imageErrorIds[sid]) {
                        return <img src={imgSrc} alt="avatar" className="w-full h-full object-cover object-center" onError={() => markImageError(sid)} />;
                      }
                      return <span className="text-xl font-semibold text-gray-500">{(selectedStudent.name || '?').charAt(0)}</span>;
                    })()}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{selectedStudent.name}</div>
                    <div className="text-sm text-gray-600">{selectedStudent.email}</div>
                    <div className="text-sm text-gray-600">{selectedStudent.phone}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-mono text-sm text-gray-900">{selectedStudent.studentId || (selectedStudent._id ? String(selectedStudent._id).slice(-6) : '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NIC</p>
                    <p className="text-sm text-gray-900">{selectedStudent.nic || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{selectedStudent.address || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Verified</p>
                    <p className="text-sm text-gray-900">{selectedStudent.idVerified ? `Yes (${new Date(selectedStudent.idVerifiedAt).toLocaleString()})` : 'No'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enrolled Months</p>
                  <div className="mt-2 space-y-1">
                    {selectedStudent.months && selectedStudent.months.length > 0 ? selectedStudent.months.map((m: any, mi: number) => (
                      <div key={m.id || m._id || mi} className="px-3 py-2 bg-gray-50 rounded-md flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{m.name || m.title || `Month ${mi+1}`}{m.title ? ` — ${m.title}` : ''}</div>
                          <div className="text-sm text-gray-600">{(typeof m.price !== 'undefined' && m.price !== null) ? `${m.price} ${m.currency || ''}` : 'Free'}</div>
                        </div>
                      </div>
                    )) : <div className="text-sm text-gray-600">No enrolled months</div>}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={closeView} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">Close</button>
                  {selectedStudent && !selectedStudent.idVerified && <button onClick={() => { handleVerifyStudent(selectedStudent); }} className="px-6 py-3 border border-yellow-400 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-50 transition">Verify ID</button>}
                  <button onClick={() => { closeView(); openEdit(selectedStudent); }} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition">Edit</button>
                </div>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}