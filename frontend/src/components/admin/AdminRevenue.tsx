import React from 'react';
import { motion } from 'framer-motion';
import { DollarSignIcon, TrendingUpIcon, CreditCardIcon, CheckCircleIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function AdminRevenue() {
  const revenueData = [{
    month: 'Jan',
    revenue: 1800000,
    expenses: 500000
  }, {
    month: 'Feb',
    revenue: 2100000,
    expenses: 550000
  }, {
    month: 'Mar',
    revenue: 1900000,
    expenses: 520000
  }, {
    month: 'Apr',
    revenue: 2400000,
    expenses: 600000
  }, {
    month: 'May',
    revenue: 2200000,
    expenses: 580000
  }, {
    month: 'Jun',
    revenue: 2600000,
    expenses: 620000
  }];
  const classRevenue = [{
    name: 'Mechanics',
    value: 360000,
    color: '#3b82f6'
  }, {
    name: 'Electricity',
    value: 392000,
    color: '#8b5cf6'
  }, {
    name: 'Waves',
    value: 264000,
    color: '#10b981'
  }, {
    name: 'Modern Physics',
    value: 288000,
    color: '#f59e0b'
  }, {
    name: 'Thermodynamics',
    value: 260000,
    color: '#ef4444'
  }];
  const recentPayments = [{
    id: 1,
    student: 'Kasun Perera',
    amount: 'Rs. 15,000',
    class: 'Mechanics & Dynamics',
    date: '2024-12-15',
    status: 'Completed'
  }, {
    id: 2,
    student: 'Nimal Silva',
    amount: 'Rs. 14,000',
    class: 'Electricity & Magnetism',
    date: '2024-12-14',
    status: 'Completed'
  }, {
    id: 3,
    student: 'Saman Fernando',
    amount: 'Rs. 12,000',
    class: 'Waves & Optics',
    date: '2024-12-13',
    status: 'Pending'
  }, {
    id: 4,
    student: 'Dinesh Rajapaksha',
    amount: 'Rs. 16,000',
    class: 'Modern Physics',
    date: '2024-12-12',
    status: 'Completed'
  }];
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Revenue Management
        </h1>
        <p className="text-gray-600">
          Track financial performance and payments
        </p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <DollarSignIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs. 12.4M</p>
          <p className="text-sm text-green-600 mt-1">+18% from last month</p>
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">This Month</p>
            <TrendingUpIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs. 2.6M</p>
          <p className="text-sm text-blue-600 mt-1">+12% growth</p>
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Pending Payments</p>
            <CreditCardIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs. 240K</p>
          <p className="text-sm text-gray-600 mt-1">12 payments</p>
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Completed</p>
            <CheckCircleIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs. 2.36M</p>
          <p className="text-sm text-purple-600 mt-1">144 payments</p>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Revenue vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        {/* Revenue by Class */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Revenue by Class
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={classRevenue} cx="50%" cy="50%" labelLine={false} label={entry => entry.name} outerRadius={100} fill="#8884d8" dataKey="value">
                {classRevenue.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      {/* Recent Payments */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3
    }} className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentPayments.map(payment => <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {payment.student}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {payment.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{payment.class}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{payment.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${payment.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>;
}