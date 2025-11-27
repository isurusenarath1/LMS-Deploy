import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardListIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
export default function Tests() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const upcomingTests = [{
    title: 'Mechanics Final Test',
    subject: 'Mechanics & Dynamics',
    date: 'Dec 20, 2024',
    time: '2:00 PM',
    duration: '2 hours',
    topics: ["Newton's Laws", 'Energy', 'Momentum']
  }, {
    title: 'Electricity Quiz',
    subject: 'Electricity & Magnetism',
    date: 'Dec 22, 2024',
    time: '4:00 PM',
    duration: '1 hour',
    topics: ['Circuits', "Ohm's Law", 'Capacitors']
  }];
  const completedTests = [{
    title: 'Mechanics Quiz 3',
    subject: 'Mechanics & Dynamics',
    date: 'Dec 10, 2024',
    score: 85,
    grade: 'A',
    feedback: 'Excellent understanding of concepts'
  }, {
    title: 'Electricity Test 2',
    subject: 'Electricity & Magnetism',
    date: 'Dec 8, 2024',
    score: 92,
    grade: 'A+',
    feedback: 'Outstanding performance'
  }, {
    title: 'Optics Assignment',
    subject: 'Waves & Optics',
    date: 'Dec 5, 2024',
    score: 78,
    grade: 'B+',
    feedback: 'Good work, review interference concepts'
  }];
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tests & Assessments
        </h1>
        <p className="text-gray-600">Track your tests and view results</p>
      </div>
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button onClick={() => setActiveTab('upcoming')} className={`pb-3 px-4 font-semibold transition ${activeTab === 'upcoming' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
          Upcoming Tests
        </button>
        <button onClick={() => setActiveTab('completed')} className={`pb-3 px-4 font-semibold transition ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
          Completed Tests
        </button>
      </div>
      {/* Upcoming Tests */}
      {activeTab === 'upcoming' && <div className="space-y-4">
          {upcomingTests.map((test, index) => <motion.div key={index} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {test.title}
                  </h3>
                  <p className="text-gray-600">{test.subject}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ClipboardListIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">
                    {test.date} at {test.time}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <AlertCircleIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">
                    Duration: {test.duration}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Topics Covered:
                </p>
                <div className="flex flex-wrap gap-2">
                  {test.topics.map((topic, i) => <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {topic}
                    </span>)}
                </div>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition">
                Prepare for Test
              </button>
            </motion.div>)}
        </div>}
      {/* Completed Tests */}
      {activeTab === 'completed' && <div className="space-y-4">
          {completedTests.map((test, index) => <motion.div key={index} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {test.title}
                  </h3>
                  <p className="text-gray-600">{test.subject}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Completed on {test.date}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-600 mb-1">
                    {test.score}%
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Grade: {test.grade}
                  </span>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">
                    Instructor Feedback
                  </p>
                  <p className="text-green-800">{test.feedback}</p>
                </div>
              </div>
            </motion.div>)}
        </div>}
    </div>;
}