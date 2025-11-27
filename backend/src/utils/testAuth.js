const authService = require('./devAuth');
const User = require('../models/User');

const testAuth = async () => {
  console.log('\n=== Auth Testing Utility ===\n');

  try {
    // Seed users
    console.log('1. Seeding dev users...');
    await authService.seedDevUsers();

    // Get all users
    console.log('2. Fetching all users...');
    const users = await User.find().select('-password');
    console.log(`   Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.role})`);
    });

    // Test token generation
    console.log('\n3. Testing token generation...');
    if (users.length > 0) {
      const token = authService.generateDevToken(users[0]);
      console.log(`   Token generated: ${token.substring(0, 20)}...`);
    }

    console.log('\n=== Auth Setup Complete ===\n');
  } catch (err) {
    console.error('Error in auth test:', err);
  }
};

module.exports = { testAuth };
