const User = require('../models/User');
const jwt = require('jsonwebtoken');

const DEV_USERS = [
  {
    name: 'Student User',
    email: 'student@gmail.com',
    password: 'student123',
    role: 'student',
    phone: '+94771234567',
    nic: '199512345678',
    badge: 'Gold'
  },
  {
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
    phone: '+94771234568',
    nic: '199512345679',
    badge: 'Platinum'
  },
  {
    name: 'Teacher User',
    email: 'teacher@gmail.com',
    password: 'teacher123',
    role: 'teacher',
    phone: '+94771234569',
    nic: '199512345680',
    badge: 'Silver'
  }
];

const { generateStudentId } = require('./studentId');

const seedDevUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log('✓ Dev users already seeded');
      return;
    }

    // Create users one-by-one so pre-save hooks and studentId generation can run
    for (const u of DEV_USERS) {
      const userData = { ...u };
      if (userData.role === 'student') {
        try {
          userData.studentId = await generateStudentId();
        } catch (idErr) {
          console.error('Error generating studentId for dev user:', idErr);
        }
      }
      await User.create(userData);
    }

    console.log('✓ Dev users seeded successfully');
  } catch (err) {
    console.error('✗ Error seeding dev users:', err.message);
  }
};

const generateDevToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

const getDevUsers = () => DEV_USERS;

module.exports = {
  seedDevUsers,
  generateDevToken,
  getDevUsers,
  DEV_USERS
};
