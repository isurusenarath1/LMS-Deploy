import React from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, BookOpenIcon, DollarSignIcon, TrendingUpIcon, ClipboardCheckIcon, AlertCircleIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export default function AdminOverview() {
  const stats = [{
    label: 'Total Students',
    value: '156',
    change: '+12%',
    icon: UsersIcon,
    color: 'blue'
  }, {
    label: 'Active Classes',
    value: '8',
    change: '+2',
    icon: BookOpenIcon,
    color: 'purple'
  }, {
    label: 'Monthly Revenue',
    value: 'Rs. 2.4M',
    change: '+18%',
    icon: DollarSignIcon,
    color: 'green'
  }, {
    label: 'Completion Rate',
    value: '87%',
    change: '+5%',
    icon: TrendingUpIcon,
    color: 'yellow'
  }];
  const revenueData = [{
    month: 'Jan',
    revenue: 180000
  }, {
    month: 'Feb',
    revenue: 210000
  }, {
    month: 'Mar',
    revenue: 190000
  }, {
    month: 'Apr',
    revenue: 240000
  }, {
    month: 'May',
    revenue: 220000
  }, {
    month: 'Jun',
    revenue: 260000
  }];
  const enrollmentData = [{
    month: 'Jan',
    students: 120
  }, {
    month: 'Feb',
    students: 132
  }, {
    month: 'Mar',
    students: 138
  }, {
    month: 'Apr',
    students: 145
  }, {
    month: 'May',
    students: 150
  }, {
    month: 'Jun',
    students: 156
  }];
  const recentActivities = [{
    action: 'New student enrolled',
    student: 'Kasun Perera',
    time: '5 minutes ago',
    type: 'success'
  }, {
    action: 'Test completed',
    student: 'Nimal Silva',
    time: '15 minutes ago',
    type: 'info'
  }, {
    action: 'Payment received',
    student: 'Saman Fernando',
    time: '1 hour ago',
    type: 'success'
  }, {
    action: 'Low attendance alert',
    student: 'Amara Wickramasinghe',
    time: '2 hours ago',
    type: 'warning'
  }];
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
        const Icon = stat.icon;
        return <motion.div key={index} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className="text-green-600 text-sm font-semibold">
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>;
      })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Revenue Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        {/* Enrollment Chart */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Student Enrollment
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      {/* Recent Activities */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3
    }} className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recent Activities
        </h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'success' ? 'bg-green-100' : activity.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                {activity.type === 'success' ? <ClipboardCheckIcon className="w-5 h-5 text-green-600" /> : activity.type === 'warning' ? <AlertCircleIcon className="w-5 h-5 text-yellow-600" /> : <UsersIcon className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.student}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>)}
        </div>
      </motion.div>
    </div>;
}