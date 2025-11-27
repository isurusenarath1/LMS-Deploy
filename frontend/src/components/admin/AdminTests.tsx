import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, ClipboardListIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EditIcon } from 'lucide-react';
export default function AdminTests() {
  const tests = [{
    id: 1,
    title: 'Mechanics Final Test',
    class: 'Mechanics & Dynamics',
    date: '2024-12-20',
    duration: '2 hours',
    totalMarks: 100,
    students: 24,
    completed: 18,
    avgScore: 82,
    status: 'Scheduled'
  }, {
    id: 2,
    title: 'Electricity Quiz 2',
    class: 'Electricity & Magnetism',
    date: '2024-12-18',
    duration: '1 hour',
    totalMarks: 50,
    students: 28,
    completed: 28,
    avgScore: 78,
    status: 'Completed'
  }, {
    id: 3,
    title: 'Waves Mid-Term',
    class: 'Waves & Optics',
    date: '2024-12-22',
    duration: '1.5 hours',
    totalMarks: 75,
    students: 22,
    completed: 0,
    avgScore: 0,
    status: 'Scheduled'
  }, {
    id: 4,
    title: 'Modern Physics Quiz 1',
    class: 'Modern Physics',
    date: '2024-12-15',
    duration: '45 minutes',
    totalMarks: 30,
    students: 18,
    completed: 18,
    avgScore: 85,
    status: 'Completed'
  }];
  return <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Management
          </h1>
          <p className="text-gray-600">Create and manage assessments</p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
          <PlusIcon className="w-5 h-5" />
          <span>Create Test</span>
        </button>
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
            <p className="text-gray-600 text-sm">Total Tests</p>
            <ClipboardListIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">24</p>
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
            <p className="text-gray-600 text-sm">Scheduled</p>
            <ClockIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">6</p>
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
            <p className="text-gray-600 text-sm">Completed</p>
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">18</p>
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
            <p className="text-gray-600 text-sm">Avg Score</p>
            <ClipboardListIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">81%</p>
        </motion.div>
      </div>
      {/* Tests List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Test Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Date & Duration
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Avg Score
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tests.map((test, index) => <motion.tr key={test.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.05
            }} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {test.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {test.totalMarks} marks
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{test.class}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{test.date}</p>
                      <p className="text-sm text-gray-600">{test.duration}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {test.completed}/{test.students}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {Math.round(test.completed / test.students * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{
                      width: `${test.completed / test.students * 100}%`
                    }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-semibold text-gray-900">
                      {test.avgScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${test.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        View Results
                      </button>
                    </div>
                  </td>
                </motion.tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}