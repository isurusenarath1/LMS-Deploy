const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { seedDevUsers, generateDevToken, getDevUsers } = require('../utils/devAuth');

router.post('/seed-dev-users', async (req, res) => {
  try {
    await seedDevUsers();
    const users = await User.find().select('-password');
    res.json({ success: true, message: 'Dev users seeded', users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/dev-users', (req, res) => {
  const users = getDevUsers().map(u => {
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
  res.json({ success: true, users });
});

router.post('/quick-login/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const token = generateDevToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        nic: user.nic,
        badge: user.badge
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/clear-users', async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ success: true, message: 'All users cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
