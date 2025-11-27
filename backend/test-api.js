#!/usr/bin/env node

/**
 * Backend Verification Script
 * Tests authentication, database connectivity, and admin endpoints
 */

const BASE_URL = 'http://localhost:5000';
let adminToken = '';
let studentToken = '';

async function makeRequest(method, endpoint, body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (err) {
    console.error(`Error calling ${endpoint}:`, err.message);
    return { status: 0, data: { error: err.message } };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Backend Verification Tests');
  console.log('='.repeat(60) + '\n');

  // Test 1: Health Check
  console.log('📋 Test 1: Health Check');
  const health = await makeRequest('GET', '/');
  if (health.status === 200) {
    console.log('✅ Server is running\n');
  } else {
    console.log('❌ Server not responding\n');
    return;
  }

  // Test 2: Admin Login
  console.log('📋 Test 2: Admin Login');
  const adminLogin = await makeRequest('POST', '/api/auth/login', {
    email: 'admin@gmail.com',
    password: 'admin'
  });
  if (adminLogin.status === 200 && adminLogin.data.token) {
    adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${adminToken.substring(0, 20)}...\n`);
  } else {
    console.log('❌ Admin login failed');
    console.log(`   Error: ${adminLogin.data.message}\n`);
  }

  // Test 3: Student Login
  console.log('📋 Test 3: Student Login');
  const studentLogin = await makeRequest('POST', '/api/auth/login', {
    email: 'student@gmail.com',
    password: 'student'
  });
  if (studentLogin.status === 200 && studentLogin.data.token) {
    studentToken = studentLogin.data.token;
    console.log('✅ Student login successful');
    console.log(`   Token: ${studentToken.substring(0, 20)}...\n`);
  } else {
    console.log('❌ Student login failed');
    console.log(`   Error: ${studentLogin.data.message}\n`);
  }

  // Test 4: Get Current User Profile
  console.log('📋 Test 4: Get Current User Profile');
  const profile = await makeRequest('GET', '/api/auth/me', null, studentToken);
  if (profile.status === 200) {
    console.log('✅ Profile retrieved');
    console.log(`   Name: ${profile.data.user.name}`);
    console.log(`   Email: ${profile.data.user.email}`);
    console.log(`   Role: ${profile.data.user.role}\n`);
  } else {
    console.log('❌ Profile retrieval failed');
    console.log(`   Error: ${profile.data.message}\n`);
  }

  // Test 5: New User Registration
  console.log('📋 Test 5: Register New Student');
  const timestamp = Date.now();
  const newStudent = await makeRequest('POST', '/api/auth/register', {
    name: 'Test Student ' + timestamp,
    email: `test${timestamp}@example.com`,
    password: 'password123',
    phone: '+94 71 234 5678',
    nic: '199512345678',
    badge: 'Gold'
  });
  if (newStudent.status === 201) {
    console.log('✅ Registration successful');
    console.log(`   Name: ${newStudent.data.user.name}`);
    console.log(`   Email: ${newStudent.data.user.email}`);
    console.log(`   Token: ${newStudent.data.token.substring(0, 20)}...\n`);
  } else {
    console.log('❌ Registration failed');
    console.log(`   Error: ${newStudent.data.message}\n`);
  }

  // Test 6: Admin Get All Students
  console.log('📋 Test 6: Admin Get All Students');
  const allStudents = await makeRequest('GET', '/api/admin/students', null, adminToken);
  if (allStudents.status === 200) {
    console.log('✅ Students retrieved');
    console.log(`   Total students: ${allStudents.data.students.length}`);
    if (allStudents.data.students.length > 0) {
      console.log(`   First student: ${allStudents.data.students[0].name}\n`);
    } else {
      console.log('   (No students in database)\n');
    }
  } else {
    console.log('❌ Failed to get students');
    console.log(`   Error: ${allStudents.data.message}\n`);
  }

  // Test 7: Admin Create Student
  console.log('📋 Test 7: Admin Create New Student');
  const createStudent = await makeRequest('POST', '/api/admin/students', {
    name: 'Kasun Perera',
    email: `kasun${Date.now()}@example.com`,
    password: 'password123',
    phone: '+94 71 234 5678',
    nic: '199512345678',
    badge: 'Silver',
    address: '123 Main Street'
  }, adminToken);
  if (createStudent.status === 201) {
    console.log('✅ Student created by admin');
    console.log(`   Name: ${createStudent.data.student.name}`);
    console.log(`   Email: ${createStudent.data.student.email}\n`);
  } else {
    console.log('❌ Failed to create student');
    console.log(`   Error: ${createStudent.data.message}\n`);
  }

  // Test 8: User Update Profile
  console.log('📋 Test 8: Update User Profile');
  const updateProfile = await makeRequest('PUT', '/api/users/profile', {
    name: 'Updated Student Name',
    badge: 'Platinum'
  }, studentToken);
  if (updateProfile.status === 200) {
    console.log('✅ Profile updated');
    console.log(`   Name: ${updateProfile.data.user.name}`);
    console.log(`   Badge: ${updateProfile.data.user.badge}\n`);
  } else {
    console.log('❌ Profile update failed');
    console.log(`   Error: ${updateProfile.data.message}\n`);
  }

  // Test 9: Change Password
  console.log('📋 Test 9: Change Password');
  const changePassword = await makeRequest('POST', '/api/users/change-password', {
    currentPassword: 'student',
    newPassword: 'newpassword123',
    confirmPassword: 'newpassword123'
  }, studentToken);
  if (changePassword.status === 200) {
    console.log('✅ Password changed successfully');
    console.log(`   Message: ${changePassword.data.message}\n`);
  } else {
    console.log('❌ Password change failed');
    console.log(`   Error: ${changePassword.data.message}\n`);
  }

  // Test 10: Login with New Password
  console.log('📋 Test 10: Login with New Password');
  const newPasswordLogin = await makeRequest('POST', '/api/auth/login', {
    email: 'student@gmail.com',
    password: 'newpassword123'
  });
  if (newPasswordLogin.status === 200) {
    console.log('✅ Login with new password successful\n');
  } else {
    console.log('❌ Login with new password failed');
    console.log(`   Error: ${newPasswordLogin.data.message}`);
    console.log('   (Try resetting password or using original credentials)\n');
  }

  console.log('='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60) + '\n');
}

console.log('⏳ Waiting 2 seconds for server to stabilize...');
setTimeout(runTests, 2000);
