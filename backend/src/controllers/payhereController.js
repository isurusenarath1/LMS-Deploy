const Order = require('../models/Order');
const crypto = require('crypto');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// helper to format amount to 2 decimal places without thousand separators
function formatAmount(a) {
  return Number(a).toFixed(2);
}

// POST /api/payhere/create?orderId=...
// Requires authenticated user. Generates PayHere form fields including hash and returns them.
exports.createCheckout = async (req, res) => {
  try {
    const orderId = req.query.orderId || (req.body && req.body.orderId);
    if (!orderId) return res.status(400).json({ success: false, message: 'orderId required' });

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // read merchant config from env
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const env = (process.env.PAYHERE_ENV || 'sandbox').toLowerCase();
    if (!merchantId || !merchantSecret) return res.status(500).json({ success: false, message: 'PayHere not configured' });

    const actionUrl = env === 'live' ? 'https://www.payhere.lk/pay/checkout' : 'https://sandbox.payhere.lk/pay/checkout';

    // Build required fields
    const amount = formatAmount(order.total || 0);
    const currency = 'LKR';
    const order_id = String(order._id);
    // customer details - pull from order.customer if available
    const customer = (order.customer) ? order.customer : {};
    const first_name = (customer.name || '').split(' ')[0] || '';
    const last_name = (customer.name || '').split(' ').slice(1).join(' ') || '';
    const email = customer.email || '';
    const phone = customer.phone || '';
    const address = customer.address || '';
    const city = customer.city || '';
    const country = customer.country || 'Sri Lanka';

    // items string - join item names
    const items = (order.items || []).map(i => i.name).join(', ') || 'Order';

    // generate hash as per PayHere docs: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashBase = `${merchantId}${order_id}${amount}${currency}${hashedSecret}`;
    const hash = crypto.createHash('md5').update(hashBase).digest('hex').toUpperCase();

    const return_url = (req.body && req.body.return_url) || `${req.protocol}://${req.get('host')}/checkout/return`;
    const cancel_url = (req.body && req.body.cancel_url) || `${req.protocol}://${req.get('host')}/checkout/cancel`;
    const notify_url = (req.body && req.body.notify_url) || `${req.protocol}://${req.get('host')}/api/payhere/notify`;

    const payload = {
      merchant_id: merchantId,
      return_url,
      cancel_url,
      notify_url,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country,
      order_id,
      items,
      currency,
      amount,
      hash
    };

    return res.json({ success: true, action: actionUrl, fields: payload });
  } catch (err) {
    console.error('createCheckout error', err);
    res.status(500).json({ success: false, message: 'Failed to create checkout' });
  }
};

// POST /api/payhere/notify - public callback from PayHere
exports.handleNotification = async (req, res) => {
  try {
    // PayHere sends application/x-www-form-urlencoded POST
    const body = req.body || {};
    const merchant_id = body.merchant_id;
    const order_id = body.order_id;
    const payhere_amount = body.payhere_amount;
    const payhere_currency = body.payhere_currency;
    const status_code = body.status_code;
    const md5sig = body.md5sig;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantSecret) return res.status(500).send('Missing merchant secret');

    // compute local md5sig
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const local = crypto.createHash('md5').update(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`).digest('hex').toUpperCase();

    if (local !== String(md5sig).toUpperCase()) {
      console.warn('PayHere notify md5sig mismatch', { local, md5sig });
      return res.status(400).send('Invalid signature');
    }

    // find order and update status based on status_code
    const order = await Order.findById(order_id);
    if (!order) {
      console.warn('PayHere notify: order not found', order_id);
      return res.status(404).send('Order not found');
    }

    if (String(status_code) === '2') {
      order.status = 'completed';
      order.payment = order.payment || {};
      order.payment.method = 'online';
      order.payment.payhere = body;
      await order.save();

      // Automatic enrollment: add the purchasing user to all courses that belong to the purchased months
      try {
        const purchaserId = order.user;
        if (purchaserId && mongoose.Types.ObjectId.isValid(purchaserId)) {
          const monthIds = (order.items || []).map(i => i.monthId).filter(Boolean).map(String);
          if (monthIds.length > 0) {
            // find courses with month in monthIds and add purchaser to students set
            const resUpdate = await Course.updateMany(
              { month: { $in: monthIds } },
              { $addToSet: { students: mongoose.Types.ObjectId(purchaserId) } }
            );
            console.log('Enroll update result:', resUpdate);
          }
        } else {
          console.warn('PayHere notify: order has no user id, skipping enrollment', order._id);
        }
      } catch (enErr) {
        console.error('Automatic enrollment failed:', enErr);
      }

      return res.send('OK');
    } else if (String(status_code) === '0') {
      order.status = 'pending';
      order.payment = order.payment || {};
      order.payment.payhere = body;
      await order.save();
      return res.send('OK');
    } else {
      // failure or other codes
      order.status = 'failed';
      order.payment = order.payment || {};
      order.payment.payhere = body;
      await order.save();
      return res.send('OK');
    }
  } catch (err) {
    console.error('handleNotification error', err);
    res.status(500).send('Server error');
  }
};
