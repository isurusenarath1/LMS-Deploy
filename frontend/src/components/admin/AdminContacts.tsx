import React, { useEffect, useMemo, useState } from 'react';
import contactService from '../../services/contactService';
import { toast } from 'sonner';
import { TrashIcon } from 'lucide-react';

export default function AdminContacts() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await contactService.listMessages();
      if (res && res.success) {
        setMessages(res.messages || []);
      } else {
        toast.error(res.message || 'Failed to load messages');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await contactService.markRead(id);
      if (res && res.success) {
        toast.success('Marked read');
        load();
      } else {
        toast.error(res.message || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating message');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await contactService.deleteMessage(id);
      if (res && res.success) {
        toast.success('Deleted');
        setMessages(prev => prev.filter(m => m._id !== id));
        if (selected && selected._id === id) setSelected(null);
      } else {
        toast.error(res.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting message');
    }
  };

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    let list = messages.slice();
    if (filterUnread) list = list.filter(m => !m.read);
    if (q) list = list.filter(m => (m.subject && m.subject.toLowerCase().includes(q)) || (m.name && m.name.toLowerCase().includes(q)) || (m.email && m.email.toLowerCase().includes(q)) || (m.message && m.message.toLowerCase().includes(q)));
    return list;
  }, [messages, query, filterUnread]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contact US Messages</h1>
        <div className="text-sm text-gray-600">{loading ? 'Loading...' : `${messages.length} total • ${messages.filter(m=>!m.read).length} unread`}</div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <input value={query} onChange={e=>{setQuery(e.target.value); setPage(1);}} placeholder="Search messages" className="px-3 py-2 border rounded-lg w-64" />
            <button onClick={()=>{setFilterUnread(prev=>!prev); setPage(1);}} className={`px-3 py-2 rounded-lg ${filterUnread ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{filterUnread ? 'Showing: Unread' : 'Show Unread'}</button>
            <button onClick={load} className="px-3 py-2 rounded-lg bg-gray-100">Refresh</button>
          </div>
          <div className="text-sm text-gray-500">Page {page} / {totalPages}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: list */}
          <div className="col-span-1 border-r pr-2">
            <div className="space-y-2">
              {paged.map(m => (
                <button key={m._id} onClick={()=>setSelected(m)} className={`w-full text-left p-3 rounded-lg flex justify-between items-start ${selected && selected._id === m._id ? 'bg-blue-50' : m.read ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{m.subject}</div>
                      {!m.read && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">New</span>}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{m.name} • {m.email}</div>
                    <div className="text-sm text-gray-700 mt-2 line-clamp-2">{m.message}</div>
                  </div>
                  <div className="ml-2 text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
                </button>
              ))}
              {!loading && paged.length === 0 && <div className="p-4 text-gray-500">No messages found.</div>}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">{filtered.length} matched</div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setPage(p => Math.max(1, p-1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
                <button onClick={()=>setPage(p => Math.min(totalPages, p+1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
              </div>
            </div>
          </div>

          {/* Right: detail */}
          <div className="col-span-2">
            {selected ? (
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selected.subject}</h2>
                    <div className="text-sm text-gray-500">From {selected.name} • {selected.email}</div>
                    <div className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selected.read && <button onClick={()=>{handleMarkRead(selected._id); setSelected({...selected, read:true});}} className="px-3 py-1 bg-green-600 text-white rounded">Mark read</button>}
                    <button onClick={()=>{handleDelete(selected._id);}} className="px-3 py-1 bg-red-100 text-red-700 rounded flex items-center gap-2"><TrashIcon className="w-4 h-4" />Delete</button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded text-sm whitespace-pre-wrap">{selected.message}</div>
              </div>
            ) : (
              <div className="p-6 text-gray-600">Select a message to view details</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
