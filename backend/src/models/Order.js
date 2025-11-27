const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
  batchYear: { type: String },
  monthId: { type: String },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'LKR' }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [OrderItemSchema],
  total: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['bank', 'cash', 'online'], default: 'bank' },
  payment: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
