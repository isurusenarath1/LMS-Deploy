const Order = require('../models/Order');
const path = require('path');
const fs = require('fs');

// Helper: save a data URL (base64) to a file under uploads/orders and return relative path
async function saveDataUrlToFile(dataUrl, filenameBase) {
  try {
    const matches = String(dataUrl).match(/^data:(.+);base64,(.*)$/);
    if (!matches) return null;
    const mime = matches[1];
    const b64 = matches[2];
    const ext = mime.split('/')[1] || 'bin';
    const fileName = `${Date.now()}-${filenameBase.replace(/[^a-z0-9._-]/gi, '_')}.${ext}`;
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'orders');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
    // return web-accessible relative path
    return `/${path.join('uploads', 'orders', fileName).replace(/\\/g, '/')}`;
  } catch (err) {
    console.error('saveDataUrlToFile error', err);
    return null;
  }
}

// POST /api/orders - create an order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { items, total, customer, paymentMethod, payment } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain items' });
    }

    const orderData = {
      user: userId,
      items,
      total: total || items.reduce((s, i) => s + (i.price || 0), 0),
      paymentMethod: paymentMethod || (payment && payment.method) || 'bank',
      payment: payment || {},
      status: 'pending'
    };

    // if payment contains slipData (data URL), save it to disk and replace with path
    if (orderData.payment && orderData.payment.slipData) {
      const rel = await saveDataUrlToFile(orderData.payment.slipData, orderData.payment.slipName || 'slip');
      if (rel) {
        orderData.payment.slipPath = rel;
        delete orderData.payment.slipData;
      }
    }

    const order = new Order(orderData);
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Server error creating order' });
  }
};

// GET /api/orders/my - return orders for current user
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
    // convert slipPath to full url if starts with /
    const host = `${req.protocol}://${req.get('host')}`;
    const transformed = orders.map(o => {
      const oo = { ...o };
      if (oo.payment && oo.payment.slipPath && String(oo.payment.slipPath).startsWith('/')) {
        oo.payment.slipUrl = `${host}${oo.payment.slipPath}`;
      }
      return oo;
    });
    res.json({ success: true, orders: transformed });
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};
