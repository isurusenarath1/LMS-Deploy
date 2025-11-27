import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUpIcon, UsersIcon, BookOpenIcon, ClipboardCheckIcon, BarChart3Icon, PieChartIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export default function AdminAnalytics() {
  const performanceData = [{
    month: 'Jan',
    avgScore: 72,
    attendance: 85,
    completion: 78
  }, {
    month: 'Feb',
    avgScore: 75,
    attendance: 88,
    completion: 82
  }, {
    month: 'Mar',
    avgScore: 78,
    attendance: 90,
    completion: 85
  }, {
    month: 'Apr',
    avgScore: 82,
    attendance: 87,
    completion: 88
  }, {
    month: 'May',
    avgScore: 85,
    attendance: 92,
    completion: 90
  }, {
    month: 'Jun',
    avgScore: 88,
    attendance: 94,
    completion: 92
  }];
  const subjectPerformance = [{
    subject: 'Mechanics',
    A: 45,
    B: 30,
    C: 20,
    D: 5
  }, {
    subject: 'Electricity',
    A: 38,
    B: 35,
    C: 22,
    D: 5
  }, {
    subject: 'Waves',
    A: 52,
    B: 28,
    C: 15,
    D: 5
  }, {
    subject: 'Modern Physics',
    A: 35,
    B: 32,
    C: 25,
    D: 8
  }, {
    subject: 'Thermodynamics',
    A: 42,
    B: 33,
    C: 20,
    D: 5
  }];
  const studentEngagement = [{
    category: 'Test Scores',
    value: 88
  }, {
    category: 'Attendance',
    value: 92
  }, {
    category: 'Assignment Completion',
    value: 85
  }, {
    category: 'Class Participation',
    value: 78
  }, {
    category: 'Material Access',
    value: 95
  }];
  const enrollmentTrend = [{
    month: 'Jan',
    students: 120,
    retention: 95
  }, {
    month: 'Feb',
    students: 132,
    retention: 96
  }, {
    month: 'Mar',
    students: 138,
    retention: 94
  }, {
    month: 'Apr',
    students: 145,
    retention: 97
  }, {
    month: 'May',
    students: 150,
    retention: 98
  }, {
    month: 'Jun',
    students: 156,
    retention: 97
  }];
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive insights into performance and engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <BarChart3Icon className="w-8 h-8" />
            <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
              +8%
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Avg Performance</p>
          <p className="text-4xl font-bold">85%</p>
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <UsersIcon className="w-8 h-8" />
            <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
              +12%
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Student Growth</p>
          <p className="text-4xl font-bold">156</p>
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <ClipboardCheckIcon className="w-8 h-8" />
            <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
              +5%
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Completion Rate</p>
          <p className="text-4xl font-bold">92%</p>
        </motion.div>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <TrendingUpIcon className="w-8 h-8" />
            <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
              +3%
            </span>
          </div>
          <p className="text-sm opacity-90 mb-1">Retention Rate</p>
          <p className="text-4xl font-bold">97%</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Trends */}
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Performance Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="avgScore" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Avg Score" />
              <Area type="monotone" dataKey="attendance" stackId="2" stroke="#10b981" fill="#10b981" name="Attendance" />
              <Area type="monotone" dataKey="completion" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" name="Completion" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Student Engagement Radar */}
        <motion.div initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Student Engagement
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={studentEngagement}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Engagement" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Subject Performance */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Grade Distribution by Subject
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="A" fill="#10b981" name="Grade A" />
              <Bar dataKey="B" fill="#3b82f6" name="Grade B" />
              <Bar dataKey="C" fill="#f59e0b" name="Grade C" />
              <Bar dataKey="D" fill="#ef4444" name="Grade D" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Enrollment & Retention */}
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
            Enrollment & Retention
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} name="Students" />
              <Line yAxisId="right" type="monotone" dataKey="retention" stroke="#10b981" strokeWidth={3} name="Retention %" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.4
    }} className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUpIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">
                Performance Improvement
              </h3>
            </div>
            <p className="text-sm text-blue-800">
              Average scores have increased by 8% over the last 6 months,
              showing consistent improvement.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <UsersIcon className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">High Retention</h3>
            </div>
            <p className="text-sm text-green-800">
              Student retention rate of 97% indicates strong satisfaction and
              engagement levels.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <BookOpenIcon className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-purple-900">Top Subject</h3>
            </div>
            <p className="text-sm text-purple-800">
              Waves & Optics shows the highest grade A percentage at 52%,
              indicating effective teaching.
            </p>
          </div>
        </div>
      </motion.div>
    </div>;
}