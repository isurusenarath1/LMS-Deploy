import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, BookOpenIcon, ClipboardListIcon, FileTextIcon, BarChartIcon, SettingsIcon, BellIcon, CreditCardIcon, Menu, X } from 'lucide-react';
interface SidebarLink {
  to: string;
  icon: React.ElementType;
  label: string;
}
const links: SidebarLink[] = [{
  to: '/dashboard',
  icon: LayoutDashboardIcon,
  label: 'Overview'
}, {
  to: '/dashboard/classes',
  icon: BookOpenIcon,
  label: 'My Classes'
}, {
  to: '/dashboard/materials',
  icon: FileTextIcon,
  label: 'Materials'
}, 
// {
//   to: '/dashboard/progress',
//   icon: BarChartIcon,
//   label: 'Progress'
// },
 {
  to: '/dashboard/student-id',
  icon: CreditCardIcon,
  label: 'Student ID'
}, {
  to: '/dashboard/notifications',
  icon: BellIcon,
  label: 'Notifications'
}, {
  to: '/dashboard/orders',
  icon: CreditCardIcon,
  label: 'My Orders'
}, {
  to: '/dashboard/settings',
  icon: SettingsIcon,
  label: 'Settings'
}];
export default function DashboardSidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
      </div>
      <nav className="space-y-2">
        {links.map(link => {
          const Icon = link.icon as React.ElementType;
          const isActive = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to} onClick={onLinkClick} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile header: visible on small screens only; positioned at top to preview sidebar top */}
      <div className="md:hidden sticky top-0 z-40 bg-white shadow">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center space-x-2">
            <button aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(prev => !prev)} className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-lg font-semibold"></h2>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-72 bg-white shadow-md h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-md overflow-y-auto transform transition-transform duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <LayoutDashboardIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Dashboard</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Close menu">
                <X className="w-6 h-6" />
              </button>
            </div>
            <SidebarContent onLinkClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}