import React, { useEffect, useRef, useState } from 'react';
import { PlusIcon, XIcon, EditIcon, TrashIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import telegramService from '../../services/telegramService';

export default function AdminTelegramChannels() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', link: '' });
  const firstRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await telegramService.listAdminChannels();
      if (res && res.success) setChannels(res.channels || []);
      else toast.error(res.message || 'Failed to load channels');
    } catch (err: any) { toast.error(err.message || 'Error'); }
    setLoading(false);
  };

  const openAdd = () => { setEditingId(null); setForm({ name: '', description: '', link: '' }); setShowForm(true); };
  const close = () => { setShowForm(false); setEditingId(null); };

  const submit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.link) return toast.error('Please fill name and link');
    try {
      if (editingId) {
        const res = await telegramService.updateChannel(editingId, form);
        if (res.success) { toast.success('Updated'); close(); load(); } else toast.error(res.message || 'Failed');
      } else {
        const res = await telegramService.createChannel(form);
        if (res.success) { toast.success('Created'); close(); load(); } else toast.error(res.message || 'Failed');
      }
    } catch (err: any) { toast.error(err.message || 'Error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this channel?')) return;
    try {
      const res = await telegramService.deleteChannel(id);
      if (res.success) { toast.success('Deleted'); load(); } else toast.error(res.message || 'Failed');
    } catch (e: any) { toast.error(e.message || 'Error'); }
  };

  useEffect(() => {
    if (showForm && firstRef.current) firstRef.current.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    if (showForm) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showForm]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Telegram Channels</h1>
          <p className="text-gray-600">Add, edit or remove Telegram channels shown on the public site</p>
        </div>
        <button onClick={openAdd} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded">
          <PlusIcon className="w-4 h-4" /> <span>Add Channel</span>
        </button>
      </div>

      {loading && <div className="text-sm text-gray-600 mb-3">Loading...</div>}

      {/* Eye-catching grid of channel cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((c) => {
          const color = (c.meta && c.meta.color) || 'blue';
          return (
            <div key={c._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-[1.01] transform transition">
              <div className={`p-4 bg-gradient-to-r from-${color}-500 to-${color}-600 text-white`}> 
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Telegram Channel</div>
                    <div className="text-lg font-bold mt-1">{c.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-90">Members</div>
                    <div className="font-semibold">{(c.meta && c.meta.members) || '—'}</div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-700 mb-4 line-clamp-3">{c.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <a href={c.link} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 bg-${color}-50 text-${color}-600 px-3 py-2 rounded-md font-semibold hover:shadow`}>
                      <SendIcon className={`w-4 h-4 text-${color}-600`} />
                      <span>Join Channel</span>
                    </a>
                    {/* <a href={c.link} target="_blank" rel="noreferrer" className="text-xs text-gray-500 underline ml-2">Open in new tab</a> */}
                  </div>
                  <div className="flex items-center gap-2">
                    <button title="Edit" onClick={() => { setEditingId(c._id); setForm({ name: c.name, description: c.description || '', link: c.link }); setShowForm(true); }} className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                      <EditIcon className="w-4 h-4 text-gray-700" />
                    </button>
                    <button title="Delete" onClick={() => handleDelete(c._id)} className="p-2 bg-red-50 rounded hover:bg-red-100">
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={close}>
          <div className="bg-white rounded-lg w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold">{editingId ? 'Edit Channel' : 'Add Channel'}</h3><button onClick={close}><XIcon /></button></div>
            <form onSubmit={submit} className="space-y-4">
              <div><label className="block text-sm">Name</label><input ref={firstRef} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded" required /></div>
              <div><label className="block text-sm">Link</label><input type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="w-full p-2 border rounded" placeholder="https://t.me/your_channel" required /></div>
              <div><label className="block text-sm">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded" rows={3} /></div>
              <div className="flex gap-3">
                <button type="button" onClick={close} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
