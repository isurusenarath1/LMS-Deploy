import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, FileTextIcon, DownloadIcon, TrashIcon, FolderIcon, UploadIcon } from 'lucide-react';
import materialService from '../../services/materialService';
import { toast } from 'sonner';

export default function AdminMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [cls, setCls] = useState('');
  const [description, setDescription] = useState('');

  const [batches, setBatches] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editMonth, setEditMonth] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://lms-deploy-backend.vercel.app/api';

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const res: any = await materialService.getMaterials();
      if (res && res.success) setMaterials(res.materials || []);
      else toast.error(res?.message || 'Failed to load materials');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    try {
      const r = await fetch(`${API_BASE}/batches`);
      const data = await r.json();
      if (Array.isArray(data)) setBatches(data);
      else if (data && data.success && Array.isArray(data.batches)) setBatches(data.batches);
    } catch (e) {
      console.error('loadBatches', e);
    }
  };

  const loadMonths = async () => {
    try {
      const r = await fetch(`${API_BASE}/months`);
      const data = await r.json();
      if (Array.isArray(data)) setMonths(data);
      else if (data && data.success && Array.isArray(data.items || data.months)) setMonths(data.items || data.months || []);
    } catch (e) {
      console.error('loadMonths', e);
    }
  };

  useEffect(() => { loadMaterials(); }, []);
  useEffect(() => { loadBatches(); loadMonths(); }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Materials</h1>
          <p className="text-gray-600">Upload and manage study resources</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowUpload(s => !s)} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition">
            <UploadIcon className="w-5 h-5" />
            <span>{showUpload ? 'Close' : 'Upload Material'}</span>
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="p-2 border rounded" />
            <select value={selectedBatch} onChange={e=>setSelectedBatch(e.target.value)} className="p-2 border rounded">
              <option value="">Select Batch (optional)</option>
              {batches.map(b => <option key={b._id || b.year} value={b.year || b._id}>{b.title || b.year}</option>)}
            </select>
            <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} className="p-2 border rounded">
              <option value="">Select Month (optional)</option>
              {months.filter(m => !selectedBatch || m.batchYear === selectedBatch).map(m => <option key={m._id} value={m._id}>{m.name}{m.title ? ` - ${m.title}`: ''} ({m.batchYear})</option>)}
            </select>
            <input type="file" onChange={e => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} className="p-2" />
          </div>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Optional description" className="mt-3 w-full p-2 border rounded" />
          <div className="mt-3 flex gap-2">
            <button onClick={async ()=>{
              if (!title || !file) { toast.error('Title and file required'); return; }
              const fd = new FormData();
              fd.append('title', title);
              fd.append('class', cls);
              fd.append('description', description);
              if (selectedBatch) fd.append('batchYear', selectedBatch);
              if (selectedMonth) fd.append('monthId', selectedMonth);
              fd.append('file', file as File);
              try {
                const res: any = await materialService.uploadMaterial(fd);
                if (res && res.success) { toast.success('Uploaded'); setShowUpload(false); setTitle(''); setCls(''); setDescription(''); setFile(null); loadMaterials(); }
                else toast.error(res?.message || 'Upload failed');
              } catch (err) { console.error(err); toast.error('Upload failed'); }
            }} className="px-4 py-2 bg-green-600 text-white rounded">Upload</button>
            <button onClick={()=>{ setShowUpload(false); setFile(null); }} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Files</p>
            <FileTextIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{materials.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Downloads</p>
            <DownloadIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{materials.reduce((s,m)=>s+(m.downloads||0),0)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Storage Used</p>
            <FolderIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{(materials.reduce((s,m)=>(s+(m.fileSize||0)),0)/1024/1024).toFixed(2)} MB</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">This Month</p>
            <PlusIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{materials.filter(m => (new Date(m.createdAt)).getMonth() === (new Date()).getMonth()).length}</p>
        </motion.div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Size</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Upload Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Downloads</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && <tr><td colSpan={7} className="p-4 text-sm text-gray-500">Loading...</td></tr>}
              {!loading && materials.map((material, index) => (
                <motion.tr key={material._id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileTextIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      {editingId === material._id ? (
                        <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} className="p-1 border rounded w-full" />
                      ) : (
                        <span className="font-medium text-gray-900">{material.title}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === material._id ? (
                      <input value={editClass} onChange={e=>setEditClass(e.target.value)} className="p-1 border rounded w-full" />
                    ) : (
                      <span className="text-gray-900">{material.class}</span>
                    )}
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-medium">{material.fileType ? material.fileType.split('/').pop() : ''}</span></td>
                  <td className="px-6 py-4"><span className="text-gray-900">{material.fileSize ? `${(material.fileSize/1024).toFixed(1)} KB` : ''}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900">{material.createdAt ? new Date(material.createdAt).toLocaleDateString() : ''}</span>
                      <div className="mt-1 flex items-center space-x-2">
                          {editingId === material._id ? (
                            <div className="flex items-center space-x-2">
                              <select value={editBatch} onChange={e=>setEditBatch(e.target.value)} className="p-1 border rounded">
                                <option value="">Batch (optional)</option>
                                {batches.map(b => <option key={b._id || b.year} value={b.year || b._id}>{b.title || b.year}</option>)}
                              </select>
                              <select value={editMonth} onChange={e=>setEditMonth(e.target.value)} className="p-1 border rounded">
                                <option value="">Month (optional)</option>
                                {months.filter(m => !editBatch || m.batchYear === editBatch).map(m => <option key={m._id} value={m._id}>{m.name} ({m.batchYear})</option>)}
                              </select>
                            </div>
                          ) : (
                            <>
                              {material.batchYear ? <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">Batch: {material.batchYear}</span> : null}
                              {material.month ? <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs">Month: {material.month.name || material.month}</span> : null}
                            </>
                          )}
                        {!material.batchYear && !material.month ? <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Public</span> : <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Restricted</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-gray-900">{material.downloads || 0}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {material.fileUrl ? <a href={material.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"><DownloadIcon className="w-4 h-4" /></a> : null}
                      {editingId === material._id ? (
                        <>
                          <button onClick={async ()=>{
                            // Save edits
                            try {
                              const payload: any = { title: editTitle, class: editClass, description: editDescription };
                              if (editBatch) payload.batchYear = editBatch; else payload.batchYear = null;
                              if (editMonth) payload.month = editMonth; else payload.month = null;
                              const res: any = await materialService.updateMaterial(material._id, payload);
                              if (res && res.success) { toast.success('Updated'); setEditingId(null); loadMaterials(); }
                              else toast.error(res?.message || 'Update failed');
                            } catch (err) { console.error(err); toast.error('Update failed'); }
                          }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">Save</button>
                          <button onClick={()=>{ setEditingId(null); }} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={()=>{
                            // Start editing
                            setEditingId(material._id);
                            setEditTitle(material.title || '');
                            setEditClass(material.class || '');
                            setEditBatch(material.batchYear || '');
                            setEditMonth(material.month? (material.month._id || material.month) : '');
                            setEditDescription(material.description || '');
                          }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">Edit</button>
                          <button onClick={async ()=>{
                            if (!confirm('Delete this material?')) return;
                            try {
                              const res: any = await materialService.deleteMaterial(material._id);
                              if (res && res.success) { toast.success('Deleted'); loadMaterials(); }
                              else toast.error(res?.message || 'Delete failed');
                            } catch (err) { console.error(err); toast.error('Delete failed'); }
                          }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><TrashIcon className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}