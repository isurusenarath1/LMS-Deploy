import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileTextIcon, DownloadIcon, EyeIcon, BookOpenIcon } from 'lucide-react';
import materialService from '../../services/materialService';
import { toast } from 'sonner';

export default function Materials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    materialService.getMaterials()
      .then((res: any) => {
        if (!mounted) return;
        if (res && res.success) setMaterials(res.materials || []);
        else toast.error(res?.message || 'Failed to load materials');
      })
      .catch(err => { console.error(err); toast.error('Failed to load materials'); })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Materials</h1>
        <p className="text-gray-600">Access your course materials and resources</p>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading materials...</div>}

      <div className="space-y-6">
        {materials.map((m, idx) => (
          <motion.div key={m._id || idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center">
              <BookOpenIcon className="w-6 h-6 text-white mr-3" />
              <h2 className="text-xl font-bold text-white">{m.class || 'General'}</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileTextIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{m.title}</h3>
                      {m.description && <p className="text-sm text-gray-600 mt-1">{m.description}</p>}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{m.fileType ? m.fileType.split('/').pop()?.toUpperCase() : 'FILE'}</span>
                        <span>•</span>
                        <span>{m.fileSize ? `${(m.fileSize/1024).toFixed(1)} KB` : ''}</span>
                        <span>•</span>
                        <span>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {m.fileUrl ? (
                      <a href={m.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <EyeIcon className="w-5 h-5" />
                      </a>
                    ) : null}
                    {m.fileUrl ? (
                      <a href={m.fileUrl} download className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
                        <DownloadIcon className="w-5 h-5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}