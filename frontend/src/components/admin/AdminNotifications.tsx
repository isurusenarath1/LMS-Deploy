import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, SendIcon, UsersIcon, BookOpenIcon } from 'lucide-react';
import { toast } from 'sonner';
import notificationService from '../../services/notificationService';
export default function AdminNotifications() {
  const [notificationData, setNotificationData] = useState({
    recipient: 'all',
    title: '',
    message: '',
    type: 'info',
    batchYear: '',
    userId: ''
  });
  const [sentList, setSentList] = useState<any[]>([]);
  const handleSendNotification = () => {
    if (!notificationData.title || !notificationData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    const target: any = { type: 'all' };
    if (notificationData.recipient === 'class') {
      target.type = 'batch';
      target.batchYear = notificationData.batchYear || '';
    }
    if (notificationData.recipient === 'individual') {
      target.type = 'user';
      target.userId = notificationData.userId || '';
    }

    notificationService.adminSendNotification({
      title: notificationData.title,
      message: notificationData.message,
      target
    }).then((res: any) => {
      if (res && res.success) {
        toast.success('Notification sent successfully!');
        setNotificationData({ recipient: 'all', title: '', message: '', type: 'info', batchYear: '', userId: '' });
        loadSent();
      } else {
        toast.error(res?.message || 'Failed to send notification');
      }
    }).catch((err) => {
      console.error('send notification error', err);
      toast.error('Failed to send notification');
    });
  };

  const loadSent = async () => {
    try {
      const res: any = await notificationService.adminListNotifications();
      if (res && res.success && Array.isArray(res.notifications)) {
        setSentList(res.notifications.slice(0, 10));
      }
    } catch (err) {
      console.error('loadSent error', err);
    }
  };

  useEffect(() => {
    loadSent();
  }, []);
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Send Notifications
        </h1>
        <p className="text-gray-600">
          Send notifications to students and staff
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Form */}
        <div className="lg:col-span-2">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Create Notification
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>
                <select value={notificationData.recipient} onChange={e => setNotificationData({
                ...notificationData,
                recipient: e.target.value
              })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Students</option>
                  <option value="class">Specific Class</option>
                  <option value="individual">Individual Student</option>
                </select>
              </div>
              {notificationData.recipient === 'class' && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
                <input value={notificationData.batchYear} onChange={e => setNotificationData({ ...notificationData, batchYear: e.target.value })} placeholder="e.g. 2026" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>}
              {notificationData.recipient === 'individual' && <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID / User ID</label>
                <input value={notificationData.userId} onChange={e => setNotificationData({ ...notificationData, userId: e.target.value })} placeholder="User ID" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {['info', 'success', 'warning', 'error'].map(type => <button key={type} onClick={() => setNotificationData({
                  ...notificationData,
                  type
                })} className={`p-3 rounded-lg border-2 transition ${notificationData.type === type ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
                      <span className="capitalize font-medium">{type}</span>
                    </button>)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input type="text" value={notificationData.title} onChange={e => setNotificationData({
                ...notificationData,
                title: e.target.value
              })} placeholder="Enter notification title" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea value={notificationData.message} onChange={e => setNotificationData({
                ...notificationData,
                message: e.target.value
              })} rows={6} placeholder="Enter your notification message..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button onClick={handleSendNotification} className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
                <SendIcon className="w-5 h-5" />
                <span>Send Notification</span>
              </button>
            </div>
          </motion.div>
        </div>
        {/* Quick Stats */}
        <div className="space-y-6">  
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.1
        }} className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Recent Notifications
            </h3>
            <div className="space-y-3">
              {sentList.length === 0 ? <div className="p-3 text-sm text-gray-500">No notifications sent yet</div> : sentList.map((s: any) => <div key={s._id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-gray-600">{s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}</p>
                </div>)}
            </div>
          </motion.div>
        </div>
      </div>
    </div>;
}