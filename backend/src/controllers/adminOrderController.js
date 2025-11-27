const Order = require('../models/Order');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// GET /api/admin/orders - list orders (admin)
exports.listOrders = async (req, res) => {
  try {
    const q = req.query || {};
    // allow optional status filter
    const filter = {};
    if (q.status) filter.status = q.status;
    // populate user info for admin view
    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('user', 'name email studentId nic').lean();
    const host = `${req.protocol}://${req.get('host')}`;
    const transformed = orders.map(o => {
      const oo = { ...o };
      // attach customer object for frontend convenience
      oo.customer = oo.user ? { name: oo.user.name, email: oo.user.email, studentId: oo.user.studentId, nic: oo.user.nic } : null;
      // normalize slip path to full URL when present
      if (oo.payment && oo.payment.slipPath && String(oo.payment.slipPath).startsWith('/')) {
        oo.payment.slipUrl = `${host}${oo.payment.slipPath}`;
      }
      return oo;
    });
    res.json({ success: true, orders: transformed });
  } catch (err) {
    console.error('Admin listOrders error', err);
    res.status(500).json({ success: false, message: 'Server error listing orders' });
  }
};

// GET /api/admin/orders/:id - get order
exports.getOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id).populate('user', 'name email studentId nic').lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const host = `${req.protocol}://${req.get('host')}`;
    const oo = { ...order };
    oo.customer = oo.user ? { name: oo.user.name, email: oo.user.email, studentId: oo.user.studentId, nic: oo.user.nic } : null;
    if (oo.payment && oo.payment.slipPath && String(oo.payment.slipPath).startsWith('/')) {
      oo.payment.slipUrl = `${host}${oo.payment.slipPath}`;
    }
    res.json({ success: true, order: oo });
  } catch (err) {
    console.error('Admin getOrder error', err);
    res.status(500).json({ success: false, message: 'Server error fetching order' });
  }
};

// PUT /api/admin/orders/:id - update order (e.g., status)
exports.updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // allow updating status and payment verification fields
    if (payload.status) order.status = payload.status;
    if (payload.payment && typeof payload.payment === 'object') {
      order.payment = { ...order.payment, ...payload.payment };
    }
    await order.save();
    // If status changed to completed, automatically enroll purchaser to related courses
    try {
      if (payload.status === 'completed') {
        const purchaserId = order.user;
        if (purchaserId && mongoose.Types.ObjectId.isValid(purchaserId)) {
          const monthIds = (order.items || []).map(i => i.monthId).filter(Boolean).map(String);
          if (monthIds.length > 0) {
            await Course.updateMany({ month: { $in: monthIds } }, { $addToSet: { students: mongoose.Types.ObjectId(purchaserId) } });
          }
        }
      }
    } catch (enErr) {
      console.error('Automatic enrollment (admin updateOrder) failed:', enErr);
    }
    res.json({ success: true, order });
  } catch (err) {
    console.error('Admin updateOrder error', err);
    res.status(500).json({ success: false, message: 'Server error updating order' });
  }
};

// DELETE /api/admin/orders/:id - delete order
exports.deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    console.error('Admin deleteOrder error', err);
    res.status(500).json({ success: false, message: 'Server error deleting order' });
  }
};

// GET /api/admin/payments - list orders with payments (bank/cash/online)
exports.listPayments = async (req, res) => {
  try {
    const q = req.query || {};
    const filter = {};
    // filter by payment method if provided
    if (q.method) filter.paymentMethod = q.method;
    // optionally filter by verified state
    if (q.verified === 'true') filter['payment.verified'] = true;
    if (q.verified === 'false') filter['payment.verified'] = { $ne: true };

    // find orders that have payment info
    const orders = await Order.find({ ...filter, payment: { $exists: true } }).sort({ createdAt: -1 }).populate('user', 'name email studentId nic').lean();
    const host = `${req.protocol}://${req.get('host')}`;
    const transformed = orders.map(o => {
      const oo = { ...o };
      oo.customer = oo.user ? { name: oo.user.name, email: oo.user.email, studentId: oo.user.studentId, nic: oo.user.nic } : null;
      if (oo.payment && oo.payment.slipPath && String(oo.payment.slipPath).startsWith('/')) {
        oo.payment.slipUrl = `${host}${oo.payment.slipPath}`;
      }
      return oo;
    });
    res.json({ success: true, payments: transformed });
  } catch (err) {
    console.error('Admin listPayments error', err);
    res.status(500).json({ success: false, message: 'Server error listing payments' });
  }
};

// PUT /api/admin/payments/:id/confirm - mark payment as verified/confirmed
exports.confirmPayment = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Set payment.verified and record admin who verified
    order.payment = { ...order.payment, verified: true, verifiedBy: req.user ? req.user._id : null, verifiedAt: new Date(), referenceChecked: payload.referenceChecked || order.payment.reference || null };

    // Optionally change order status to completed when confirming payment
    if (payload.complete !== false) {
      order.status = payload.status || 'completed';
    }

    await order.save();

    // Automatic enrollment: enroll purchaser into courses for the purchased months
    try {
      const purchaserId = order.user;
      if (purchaserId && mongoose.Types.ObjectId.isValid(purchaserId)) {
        const monthIds = (order.items || []).map(i => i.monthId).filter(Boolean).map(String);
        if (monthIds.length > 0) {
          await Course.updateMany({ month: { $in: monthIds } }, { $addToSet: { students: mongoose.Types.ObjectId(purchaserId) } });
        }
      }
    } catch (enErr) {
      console.error('Automatic enrollment (confirmPayment) failed:', enErr);
    }

    // populate user for response convenience
    const populated = await Order.findById(order._id).populate('user', 'name email studentId nic').lean();
    const host = `${req.protocol}://${req.get('host')}`;
    const oo = { ...populated };
    oo.customer = oo.user ? { name: oo.user.name, email: oo.user.email, studentId: oo.user.studentId, nic: oo.user.nic } : null;
    if (oo.payment && oo.payment.slipPath && String(oo.payment.slipPath).startsWith('/')) {
      oo.payment.slipUrl = `${host}${oo.payment.slipPath}`;
    }

    res.json({ success: true, payment: oo });
  } catch (err) {
    console.error('Admin confirmPayment error', err);
    res.status(500).json({ success: false, message: 'Server error confirming payment' });
  }
};
