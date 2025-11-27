import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUpIcon, AwardIcon } from 'lucide-react';
export default function Progress() {
  const testScores = [{
    month: 'Sep',
    score: 72
  }, {
    month: 'Oct',
    score: 78
  }, {
    month: 'Nov',
    score: 85
  }, {
    month: 'Dec',
    score: 88
  }];
  const subjectProgress = [{
    subject: 'Mechanics',
    progress: 85
  }, {
    subject: 'Electricity',
    progress: 78
  }, {
    subject: 'Waves',
    progress: 92
  }, {
    subject: 'Modern Physics',
    progress: 65
  }];
  const achievements = [{
    title: 'Perfect Attendance',
    description: 'Attended all classes this month',
    icon: '🎯',
    color: 'blue'
  }, {
    title: 'Top Performer',
    description: 'Highest score in Mechanics test',
    icon: '🏆',
    color: 'yellow'
  }, {
    title: 'Fast Learner',
    description: 'Completed 5 chapters ahead',
    icon: '⚡',
    color: 'purple'
  }];
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Progress</h1>
        <p className="text-gray-600">
          Track your learning journey and achievements
        </p>
      </div>
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <TrendingUpIcon className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">Average Score</p>
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
          <AwardIcon className="w-8 h-8 mb-3" />
          <p className="text-sm opacity-90 mb-1">Class Rank</p>
          <p className="text-4xl font-bold">#3</p>
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
          <span className="text-4xl mb-3 block">📚</span>
          <p className="text-sm opacity-90 mb-1">Completed Lessons</p>
          <p className="text-4xl font-bold">42</p>
        </motion.div>
      </div>
      {/* Test Scores Trend */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3
    }} className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Test Scores Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={testScores}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
      {/* Subject Progress */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.4
    }} className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Subject Progress
        </h2>
        <div className="space-y-4">
          {subjectProgress.map((subject, index) => <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-700">
                  {subject.subject}
                </span>
                <span className="text-gray-600">{subject.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div initial={{
              width: 0
            }} animate={{
              width: `${subject.progress}%`
            }} transition={{
              delay: 0.5 + index * 0.1,
              duration: 0.5
            }} className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" />
              </div>
            </div>)}
        </div>
      </motion.div>
      {/* Achievements */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.5
    }} className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Recent Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => <div key={index} className={`bg-${achievement.color}-50 border border-${achievement.color}-200 p-4 rounded-lg`}>
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {achievement.title}
              </h3>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>)}
        </div>
      </motion.div>
    </div>;
}