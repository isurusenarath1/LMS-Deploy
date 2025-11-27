import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, BookOpenIcon, ClipboardListIcon, FileTextIcon, BarChartIcon, SettingsIcon, BellIcon, CreditCardIcon } from 'lucide-react';
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
  return <aside className="w-64 bg-white shadow-md h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h2>
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
    </aside>;
}