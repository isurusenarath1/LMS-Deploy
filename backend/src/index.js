const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

dotenv.config();

// Verify environment variables
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI not set in .env');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET not set in .env');
  process.exit(1);
}

const connectDB = require('./config/db');
const { seedDevUsers } = require('./utils/devAuth');

const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const userRoutes = require('./routes/users');
const adminStudentsRoutes = require('./routes/adminStudents');
const adminAdminsRoutes = require('./routes/adminAdmins');
const adminOrdersRoutes = require('./routes/adminOrders');
const adminPaymentsRoutes = require('./routes/adminPayments');
const adminNotificationsRoutes = require('./routes/adminNotifications');
const adminContactsRoutes = require('./routes/adminContacts');
const contactRoutes = require('./routes/contact');
const notificationsRoutes = require('./routes/notifications');
const devAuthRoutes = require('./routes/devAuth');
const batchRoutes = require('./routes/batches');
const courseRoutes = require('./routes/courses');
const monthRoutes = require('./routes/months');
const materialRoutes = require('./routes/materials');
const ordersRoutes = require('./routes/orders');
const payhereRoutes = require('./routes/payhere');
const settingsRoutes = require('./routes/settings');
const telegramRoutes = require('./routes/telegram');
const adminTelegramRoutes = require('./routes/adminTelegram');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dev/auth', devAuthRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/students', adminStudentsRoutes);
app.use('/api/admin/admins', adminAdminsRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/payments', adminPaymentsRoutes);
app.use('/api/admin/notifications', adminNotificationsRoutes);
app.use('/api/admin/contacts', adminContactsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/months', monthRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payhere', payhereRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/admin/telegram', adminTelegramRoutes);

// Serve uploaded files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'PPP LMS backend running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
connectDB().then(async () => {
  await seedDevUsers();
  app.listen(PORT, () => {
    console.log(`✓ Server started on port ${PORT}`);
    console.log(`✓ API running at http://localhost:${PORT}`);
    console.log(`✓ Dev endpoints available at /api/dev/auth`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
