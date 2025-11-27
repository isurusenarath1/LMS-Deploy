const User = require('../models/User');
const path = require('path');
const Class = require('../models/Class');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userObj = user.toObject();
    if (userObj.profilePicture && userObj.profilePicture.startsWith('/')) {
      userObj.profilePicture = `${req.protocol}://${req.get('host')}${userObj.profilePicture}`;
    }
    res.json({ success: true, user: userObj });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user profile (name, phone, nic, address, etc.)
exports.updateProfile = async (req, res) => {
  const { name, phone, nic, address, badge } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (nic) user.nic = nic;
    if (address) user.address = address;
    if (badge) user.badge = badge;

    await user.save();

    const userObj = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      nic: user.nic,
      badge: user.badge,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    };
    if (user.profilePicture && String(user.profilePicture).startsWith('/')) {
      userObj.profilePicture = `${req.protocol}://${req.get('host')}${user.profilePicture}`;
    } else if (user.profilePicture) {
      userObj.profilePicture = user.profilePicture;
    }

    res.json({ success: true, message: 'Profile updated successfully', user: userObj });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Server error during profile update' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error during password change' });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Save relative path to user
    const relativePath = path.join('uploads', 'avatars', req.file.filename).replace(/\\/g, '/');
    user.profilePicture = `/${relativePath}`;
    await user.save();

    let url = user.profilePicture;
    if (url && String(url).startsWith('/')) {
      url = `${req.protocol}://${req.get('host')}${url}`;
    }
    res.json({ success: true, message: 'Profile picture uploaded', url });
  } catch (err) {
    console.error('Upload profile picture error:', err);
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
};

// Get classes the current user is enrolled in
exports.getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id }).populate('teacher', 'name email');
    res.json({ success: true, classes });
  } catch (err) {
    console.error('getMyClasses error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
