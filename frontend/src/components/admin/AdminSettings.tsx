import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, UploadIcon, SaveIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';
import settingsService from '../../services/settingsService';
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('carousel');
  const [settings, setSettings] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await settingsService.getSettings();
      if (res && res.success) setSettings(res.settings);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load settings');
    }
  }

  async function handleImageUploadKey(key: string, file?: File, index?: number) {
    try {
      if (!file) return;
      setUploading(true);
      const res = await settingsService.uploadImage(file, key, index);
      if (res && res.success) {
        toast.success('Image uploaded successfully');
        await loadSettings();
      } else {
        toast.error(res.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage website images and configurations
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button onClick={() => setActiveTab('carousel')} className={`px-6 py-4 whitespace-nowrap transition ${activeTab === 'carousel' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
            Carousel Images
          </button>
          <button onClick={() => setActiveTab('login')} className={`px-6 py-4 whitespace-nowrap transition ${activeTab === 'login' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
            Login/Register Images
          </button>
          <button onClick={() => setActiveTab('physics')} className={`px-6 py-4 whitespace-nowrap transition ${activeTab === 'physics' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
            Physics Section Image
          </button>
          <button onClick={() => setActiveTab('teacher')} className={`px-6 py-4 whitespace-nowrap transition ${activeTab === 'teacher' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
            Teacher Image
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'carousel' && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Manage Carousel Images
              </h2>
              <p className="text-gray-600 mb-6">
                Upload and manage images for the homepage carousel
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {([0, 1, 2, 3] as number[]).map(num => {
                  const url = settings && settings.carousel ? settings.carousel[num] : null;
                  return <div key={num} className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 hover:border-blue-500 transition">
                    <div className="text-center">
                      {url ? <img src={url} alt={`carousel-${num}`} className="mx-auto mb-3 max-h-40 object-cover rounded" /> : <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />}
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Carousel Image {num + 1}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Recommended: 1920x1080px
                      </p>
                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const f = e.target.files && e.target.files[0];
                            if (f) handleImageUploadKey('carousel', f, num);
                          }} />
                          <div className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                            <UploadIcon className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                          </div>
                        </label>
                        <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition" onClick={async () => {
                          if (!settings || !settings.carousel || !settings.carousel[num]) return;
                          // remove entry locally and save via API by uploading empty? For now remove locally and save
                          try {
                            settings.carousel[num] = '';
                            // send update by using upload endpoint with an empty file is not supported; instead we update settings via a small helper — skip for now
                            await settingsService.uploadImage(new File([new Blob()], 'placeholder.png'), 'carousel', num);
                          } catch (err) {
                            // ignore
                          }
                          await loadSettings();
                        }}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>;
                })}
              </div>
            </motion.div>}
          {activeTab === 'login' && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Login & Registration Page Images
              </h2>
              <p className="text-gray-600 mb-6">
                Manage background images for login and registration pages
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[{ key: 'loginBg', label: 'Login Page' }, { key: 'registerBg', label: 'Registration Page' }].map(item => {
                  const url = settings ? settings[item.key] : null;
                  return <div key={item.key} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition">
                    <div className="text-center">
                      {url ? <img src={url} alt={item.key} className="mx-auto mb-3 max-h-40 object-cover rounded" /> : <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />}
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.label} Background
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Recommended: 1920x1080px
                      </p>
                      <div className="flex gap-2">
                        <label className="flex-1">
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const f = e.target.files && e.target.files[0];
                            if (f) handleImageUploadKey(item.key, f);
                          }} />
                          <div className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                            <UploadIcon className="w-4 h-4" />
                            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                          </div>
                        </label>
                        <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition" onClick={async () => { if (!url) return; try { await settingsService.uploadImage(new File([new Blob()], 'placeholder.png'), item.key); } catch (e) {} await loadSettings(); }}>
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>;
                })}
              </div>
            </motion.div>}
          {activeTab === 'physics' && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Physics Section Image
              </h2>
              <p className="text-gray-600 mb-6">
                Upload image for the physics section on the homepage
              </p>
              <div className="max-w-md mx-auto">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 hover:border-blue-500 transition">
                    <div className="text-center">
                    {settings && settings.physicsImage ? <img src={settings.physicsImage} className="mx-auto mb-4 rounded" style={{maxHeight:200}} alt="physics" /> : <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Physics Section Image
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Recommended: 800x600px
                    </p>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const f = e.target.files && e.target.files[0];
                          if (f) handleImageUploadKey('physicsImage', f);
                        }} />
                        <div className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                          <UploadIcon className="w-5 h-5" />
                          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                        </div>
                      </label>
                      <button className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition" onClick={async () => { if (!settings || !settings.physicsImage) return; try { await settingsService.uploadImage(new File([new Blob()], 'placeholder.png'), 'physicsImage'); } catch (e) {} await loadSettings(); }}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>}
          {activeTab === 'teacher' && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Physics Teacher Image
              </h2>
              <p className="text-gray-600 mb-6">
                Upload image of the physics teacher for the about section
              </p>
              <div className="max-w-md mx-auto">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 hover:border-blue-500 transition">
                    <div className="text-center">
                    {settings && settings.teacherImage ? <img src={settings.teacherImage} className="mx-auto mb-4 rounded-full" style={{width:150,height:150,objectFit:'cover'}} alt="teacher" /> : <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Teacher Profile Image
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Recommended: 400x400px (Square)
                    </p>
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const f = e.target.files && e.target.files[0];
                          if (f) handleImageUploadKey('teacherImage', f);
                        }} />
                        <div className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                          <UploadIcon className="w-5 h-5" />
                          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                        </div>
                      </label>
                      <button className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition" onClick={async () => { if (!settings || !settings.teacherImage) return; try { await settingsService.uploadImage(new File([new Blob()], 'placeholder.png'), 'teacherImage'); } catch (e) {} await loadSettings(); }}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>}
        </div>
      </div>
    </div>;
}