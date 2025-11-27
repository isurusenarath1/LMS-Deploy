import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, CheckCircleIcon, ClockIcon, XIcon } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { toast } from 'sonner';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await notificationService.getMyNotifications();
      if (res && res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      } else {
        console.warn('getMyNotifications response', res);
      }
    } catch (err) {
      console.error('load notifications error', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('markAsRead error', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) {
      toast('All notifications already read');
      return;
    }
    try {
      await Promise.all(unread.map(n => notificationService.markNotificationRead(n._id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Marked all as read');
    } catch (err) {
      console.error('markAllAsRead error', err);
      toast.error('Failed to mark all as read');
    }
  };

  const dismissLocal = (id: string) => {
    // Remove locally (no server-side delete implemented)
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with your course activities</p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
          <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-800">Mark all as read</button>
        </div>
        <div className="space-y-4">
          {loading ? <div className="text-sm text-gray-500">Loading...</div> : notifications.length === 0 ? <div className="text-sm text-gray-500">No notifications</div> : notifications.map((notification, index) => <motion.div key={notification._id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.05
        }} className={`p-4 rounded-lg flex items-start ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
            <div className="mr-4">
              {notification.type === 'success' ? <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><CheckCircleIcon className="w-5 h-5 text-green-600" /></div> : notification.type === 'warning' ? <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center"><ClockIcon className="w-5 h-5 text-yellow-600" /></div> : <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><BellIcon className="w-5 h-5 text-blue-600" /></div>}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                <span className="text-xs text-gray-500">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}</span>
              </div>
              <p className="text-gray-600 mt-1">{notification.message}</p>
            </div>
            <div className="ml-2 flex flex-col gap-2">
              {!notification.isRead && <button onClick={() => markAsRead(notification._id)} className="text-sm text-blue-600">Mark read</button>}
              <button onClick={() => dismissLocal(notification._id)} className="text-gray-400 hover:text-gray-600"><XIcon className="w-5 h-5" /></button>
            </div>
          </motion.div>)}
        </div>
      </div>
    </div>;
}