import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UsersIcon, BookOpenIcon, ShoppingCartIcon, CreditCardIcon, BellIcon, QrCodeIcon, SettingsIcon, LogOutIcon, X as XIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

const links = [{
  to: '/admin/students',
  icon: UsersIcon,
  label: 'Manage Students'
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
  to: '/admin/settings',
  icon: SettingsIcon,
  label: 'Settings'
}];

export default function MobileAdminSidebar({ open, onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-72 bg-white h-full shadow-xl">
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="text-lg font-semibold">Admin Panel</h3>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-gray-100">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {links.map(l => {
            const Icon = l.icon as any;
            const isActive = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} onClick={onClose} className={`flex items-center gap-3 px-3 py-2 rounded ${isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t mt-auto">
          <button onClick={() => { onClose(); handleLogout(); }} className="w-full flex items-center gap-3 px-3 py-2 rounded text-red-600 hover:bg-red-50">
            <LogOutIcon className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
