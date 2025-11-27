const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin',
        role: 'admin'
      },
      {
        name: 'Student User',
        email: 'student@gmail.com',
        password: 'student',
        role: 'student',
        phone: '+94771234567',
        nic: '199512345678'
      }
    ];

    // Create users (password hashing happens in pre-save hook)
    const createdUsers = await User.insertMany(users);
    console.log(`✓ Created ${createdUsers.length} demo users:`);
    console.log('  - admin@gmail.com (password: admin)');
    console.log('  - student@gmail.com (password: student)');

    await mongoose.connection.close();
    console.log('✓ Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
};

seedDB();
