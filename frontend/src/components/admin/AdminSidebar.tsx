import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UsersIcon, BookOpenIcon, ShoppingCartIcon, CreditCardIcon, BellIcon, QrCodeIcon, SettingsIcon, LogOutIcon, MailIcon, SendIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
interface SidebarLink {
  to: string;
  icon: React.ElementType;
  label: string;
}
const links: SidebarLink[] = [{
  to: '/admin/students',
  icon: UsersIcon,
  label: 'Manage Students'
}, {
  to: '/admin/admins',
  icon: UsersIcon,
  label: 'Manage Admins'
}, {
  to: '/admin/classes',
  icon: BookOpenIcon,
  label: 'Manage Classes & Courses'
}, {
  to: '/admin/orders',
  icon: ShoppingCartIcon,
  label: 'Course Orders'
}, {
  to: '/admin/payments',
  icon: CreditCardIcon,
  label: 'Payments'
}, {
  to: '/admin/contacts',
  icon: MailIcon,
  label: 'Contact US Messages'
}, {
  to: '/admin/notifications',
  icon: BellIcon,
  label: 'Send Notifications'
}, {
  to: '/admin/scan-qr',
  icon: QrCodeIcon,
  label: 'Scan Student QR Codes'
}, {
  to: '/admin/materials',
  icon: BookOpenIcon,
  label: 'Manage Materials'
}, {
  to: '/admin/telegram',
  icon: SendIcon,
  label: 'Manage Telegram Channels'
}, {
  to: '/admin/settings',
  icon: SettingsIcon,
  label: 'Settings'
}];
export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    logout
  } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  // Desktop sidebar: hidden on small screens, visible from md and up
  return <aside className="hidden md:flex w-64 bg-white shadow-md h-screen sticky top-0 overflow-y-auto flex-col">
      <div className="p-6 flex-1">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {links.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return <Link key={link.to} to={link.to} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>;
        })}
        </nav>
      </div>
      {/* Logout Button */}
      <div className="p-6 border-t border-gray-200">
        <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition">
          <LogOutIcon className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>;
}