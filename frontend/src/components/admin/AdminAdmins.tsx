import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, MailIcon, PhoneIcon, EditIcon, TrashIcon, PlusIcon, XIcon, EyeIcon } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/adminService';

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdmins();
      if (res && res.success) setAdmins(res.admins || []);
      else toast.error(res.message || 'Failed to load admins');
    } catch (e: any) { toast.error(e.message || 'Error'); }
    setLoading(false);
  };

  const openAdd = () => { setEditingId(null); setForm({ name: '', email: '', phone: '', password: '' }); setShowAdd(true); };
  const close = () => { setShowAdd(false); setEditingId(null); };

  const submit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.email || (!editingId && !form.password)) { toast.error('Please fill required'); return; }
    try {
      if (editingId) {
        const res = await adminService.updateAdmin(editingId, { name: form.name, email: form.email, phone: form.phone });
        if (res.success) { toast.success('Admin updated'); close(); load(); } else toast.error(res.message || 'Failed');
      } else {
        setSubmitting(true);
        const res = await adminService.createAdmin({ name: form.name, email: form.email, password: form.password, phone: form.phone });
        if (res.success) { toast.success('Admin created'); close(); load(); } else toast.error(res.message || 'Failed');
      }
    } catch (err: any) { toast.error(err.message || 'Error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this admin?')) return;
    try {
      const res = await adminService.deleteAdmin(id);
      if (res.success) { toast.success('Deleted'); load(); } else toast.error(res.message || 'Failed');
    } catch (e: any) { toast.error(e.message || 'Error'); }
  };

  useEffect(() => {
    if (showAdd && firstInputRef.current) {
      firstInputRef.current.focus();
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    if (showAdd) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAdd]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-gray-600">Manage administrative users</p>
        </div>
        <button onClick={openAdd} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded">
          <PlusIcon className="w-4 h-4" /> <span>Add Admin</span>
        </button>
      </div>
      {loading && <div className="text-sm text-gray-600 mb-3">Loading...</div>}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Phone</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr></thead>
          <tbody>
            {admins.map(a => (<tr key={a._id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{a.name}</td>
              <td className="px-4 py-3">{a.email}</td>
              <td className="px-4 py-3">{a.phone || '—'}</td>
              <td className="px-4 py-3">
                <button onClick={() => { setEditingId(a._id); setForm({ name: a.name, email: a.email, phone: a.phone || '', password: '' }); setShowAdd(true); }} className="mr-2 text-blue-600"><EditIcon className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(a._id)} className="text-red-600"><TrashIcon className="w-4 h-4" /></button>
              </td>
            </tr>))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={close}>
          <div className="bg-white rounded-lg w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">{editingId ? 'Edit Admin' : 'Add Admin'}</h3><button onClick={close}><XIcon /></button></div>
            <form onSubmit={submit} className="space-y-4">
              <div><label className="block text-sm">Name</label><input ref={firstInputRef} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded" required /></div>
              <div><label className="block text-sm">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-2 border rounded" required /></div>
              <div><label className="block text-sm">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-2 border rounded" /></div>
              {!editingId && <div><label className="block text-sm">Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full p-2 border rounded" required /></div>}
              <div className="flex gap-3">
                <button type="button" onClick={close} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                  {submitting ? (<svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>) : null}
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
