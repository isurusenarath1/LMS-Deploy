import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import MyClasses from '../components/dashboard/MyClasses';
import Materials from '../components/dashboard/Materials';
import Progress from '../components/dashboard/Progress';
import StudentID from '../components/dashboard/StudentID';
import Notifications from '../components/dashboard/Notifications';
import Settings from '../components/dashboard/Settings';
import MyOrders from '../components/dashboard/MyOrders';
export default function DashboardPage() {
  return <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/classes" element={<MyClasses />} />
            <Route path="/materials" element={<Materials />} />
            {/* <Route path="/progress" element={<Progress />} /> */}
            <Route path="/student-id" element={<StudentID />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/orders" element={<MyOrders />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>;
}