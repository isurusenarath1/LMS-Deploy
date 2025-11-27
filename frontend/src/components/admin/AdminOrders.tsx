import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, SearchIcon, FilterIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from 'lucide-react';
import adminOrderService from '../../services/adminOrderService';
import { toast } from 'sonner';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.listOrders();
      if (res && res.success) {
        setOrders(res.orders || []);
      } else {
        toast.error(res.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id: string, status: string) => {
    try {
      const res = await adminOrderService.updateOrder(id, { status });
      if (res && res.success) {
        toast.success('Order updated');
        loadOrders();
      } else {
        toast.error(res.message || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating order');
    }
  };

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const handleView = async (id: string) => {
    setViewLoading(true);
    try {
      const res = await adminOrderService.getOrder(id);
      if (res && res.success) {
        setSelectedOrder(res.order);
      } else {
        toast.error(res.message || 'Failed to load order');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading order');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order? This action cannot be undone.')) return;
    try {
      const res = await adminOrderService.deleteOrder(id);
      if (res && res.success) {
        toast.success('Order deleted');
        loadOrders();
      } else {
        toast.error(res.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting order');
    }
  };

  const handleCloseModal = () => setSelectedOrder(null);

  const filteredOrders = orders.filter(order => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (order._id && String(order._id).toLowerCase().includes(q)) || (order.items && order.items.some((it: any) => String(it.name).toLowerCase().includes(q))) || (order.customer && String(order.customer.name || '').toLowerCase().includes(q));
    const matchesStatus = filterStatus === 'all' || (order.status && order.status.toLowerCase() === filterStatus.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Orders</h1>
        <p className="text-gray-600">Manage and track course enrollments</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search by order ID, student, or item..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && <tr><td colSpan={8} className="px-6 py-4 text-sm text-gray-500">Loading...</td></tr>}
              {!loading && filteredOrders.map((order, index) => <motion.tr key={order._id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><span className="font-mono text-sm text-gray-900">{order._id}</span></td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer ? order.customer.name : (order.user || '—')}</p>
                      <p className="text-sm text-gray-500">{order.customer ? order.customer.email : ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {order.items && order.items.map((it: any) => <div key={it.monthId} className="whitespace-nowrap">{it.name}</div>)}
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="font-semibold text-gray-900">LKR {order.total}</span></td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{order.paymentMethod}</div>
                    {order.payment && order.payment.reference && <div className="text-xs text-gray-500">Ref: {order.payment.reference}</div>}
                    {order.payment && order.payment.slipPath && (() => {
                      const p = order.payment.slipPath;
                      const url = p.startsWith('http') ? p : `${window.location.origin}${p}`;
                      return <a className="text-sm text-blue-600 underline" href={url} target="_blank" rel="noreferrer">View slip</a>;
                    })()}
                  </td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === 'completed' ? 'bg-green-100 text-green-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleView(order._id)} title="View" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><EyeIcon className="w-4 h-4" /></button>
                      {order.status !== 'completed' && <button onClick={() => handleChangeStatus(order._id, 'completed')} title="Mark completed" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"><CheckCircleIcon className="w-4 h-4" /></button>}
                      {order.status !== 'cancelled' && <button onClick={() => handleChangeStatus(order._id, 'cancelled')} title="Cancel" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><XCircleIcon className="w-4 h-4" /></button>}
                      <IconButton onClick={() => handleDelete(order._id)} title="Delete" size="small" aria-label="delete">
                        <DeleteIcon fontSize="small" className="text-red-600" />
                      </IconButton>
                    </div>
                  </td>
                </motion.tr>)}
            </tbody>
          </table>
        </div>
      </div>
      {/* View modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">Order {selectedOrder._id}</h3>
              <div className="space-x-2">
                <button onClick={handleCloseModal} className="text-sm text-gray-500">Close</button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Customer</div>
                <div className="font-medium">{selectedOrder.customer ? selectedOrder.customer.name : selectedOrder.user}</div>
                <div className="text-xs text-gray-500">{selectedOrder.customer ? selectedOrder.customer.email : ''}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Payment</div>
                <div className="font-medium">{selectedOrder.paymentMethod}</div>
                {selectedOrder.payment && selectedOrder.payment.reference && <div className="text-xs text-gray-500">Ref: {selectedOrder.payment.reference}</div>}
                {selectedOrder.payment && selectedOrder.payment.slipPath && <div className="mt-2"><a target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline" href={selectedOrder.payment.slipPath.startsWith('http') ? selectedOrder.payment.slipPath : `${window.location.origin}${selectedOrder.payment.slipPath}`}>Open slip</a></div>}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Items</div>
              <div className="space-y-2">
                {selectedOrder.items && selectedOrder.items.map((it: any) => (
                  <div key={it.monthId} className="flex items-center justify-between border rounded p-2">
                    <div>{it.name}</div>
                    <div className="font-semibold">{it.price ? `LKR ${it.price}` : 'Free'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Total</div>
              <div className="font-semibold">LKR {selectedOrder.total}</div>
            </div>
          </div>
        </div>
      )}
    </div>;
}