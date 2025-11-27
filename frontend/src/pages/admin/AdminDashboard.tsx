import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStudents from '../../components/admin/AdminStudents';
import AdminClasses from '../../components/admin/AdminClasses';
import AdminAdmins from '../../components/admin/AdminAdmins';
import AdminOrders from '../../components/admin/AdminOrders';
import AdminPayments from '../../components/admin/AdminPayments';
import AdminContacts from '../../components/admin/AdminContacts';
import AdminNotifications from '../../components/admin/AdminNotifications';
import AdminScanQR from '../../components/admin/AdminScanQR';
import AdminSettings from '../../components/admin/AdminSettings';
import AdminMaterials from '../../components/admin/AdminMaterials';
import AdminTelegramChannels from '../../components/admin/AdminTelegramChannels';
import MobileAdminSidebar from '../../components/admin/MobileAdminSidebar';
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';
export default function AdminDashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        {/* Mobile menu button - visible on small screens */}
        <div className="md:hidden p-4">
          <button onClick={() => setMobileSidebarOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-white rounded shadow">
            <MenuIcon className="w-5 h-5" />
            <span className="font-medium">Menu</span>
          </button>
        </div>
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/students" replace />} />
            <Route path="/students" element={<AdminStudents />} />
            <Route path="/admins" element={<AdminAdmins />} />
            <Route path="/classes" element={<AdminClasses />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/payments" element={<AdminPayments />} />
            <Route path="/contacts" element={<AdminContacts />} />
            <Route path="/telegram" element={<AdminTelegramChannels />} />
            <Route path="/materials" element={<AdminMaterials />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/scan-qr" element={<AdminScanQR />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
      <MobileAdminSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
    </div>;
}