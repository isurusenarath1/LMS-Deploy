import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCardIcon, DollarSignIcon, TrendingUpIcon, DownloadIcon, SearchIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminOrderService from '../../services/adminOrderService';
import { toast } from 'sonner';
export default function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState('');
  const revenueData = [{
    month: 'Jan',
    revenue: 180000
  }, {
    month: 'Feb',
    revenue: 210000
  }, {
    month: 'Mar',
    revenue: 190000
  }, {
    month: 'Apr',
    revenue: 240000
  }, {
    month: 'May',
    revenue: 220000
  }, {
    month: 'Jun',
    revenue: 260000
  }];
  const [revenueTrend, setRevenueTrend] = useState(revenueData);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [thisMonthRevenue, setThisMonthRevenue] = useState(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [averagePayment, setAveragePayment] = useState(0);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.listPayments();
      if (res && res.success) {
        const list = res.payments || [];
        setPayments(list);
        computeStats(list);
      } else {
        toast.error(res.message || 'Failed to load payments');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  function computeStats(list: any[]) {
    // total revenue: sum of completed orders or verified payments
    let total = 0;
    let thisMonth = 0;
    let completedCount = 0;
    let pendingCount = 0;

    const monthMap: Record<string, number> = {};
    const now = new Date();
    const startMonths: Date[] = [];
    // last 6 months (including current)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      startMonths.push(d);
    }
    const monthLabels = startMonths.map(d => d.toLocaleString(undefined, { month: 'short' }));
    monthLabels.forEach(l => monthMap[l] = 0);

    list.forEach(o => {
      const amt = Number(o.total || 0) || 0;
      const created = o.createdAt ? new Date(o.createdAt) : null;
      const verified = o.payment && o.payment.verified;
      const completed = o.status === 'completed' || !!verified;
      if (completed) {
        total += amt;
        completedCount += 1;
      }
      if (!o.payment || !o.payment.verified) pendingCount += 1;
      if (created) {
        const label = created.toLocaleString(undefined, { month: 'short' });
        if (label in monthMap) monthMap[label] += amt;
        if (created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()) {
          if (completed) thisMonth += amt;
        }
      }
    });

    setTotalRevenue(total);
    setThisMonthRevenue(thisMonth);
    setPendingPaymentsCount(pendingCount);
    setAveragePayment(completedCount > 0 ? Math.round(total / completedCount) : 0);

    const trend = monthLabels.map(m => ({ month: m, revenue: monthMap[m] || 0 }));
    setRevenueTrend(trend);
  }

  function exportPaymentsCSV() {
    if (!payments || payments.length === 0) {
      toast.error('No payments to export');
      return;
    }
    const rows = payments.map(p => ({
      orderId: p._id,
      studentName: p.customer ? p.customer.name : '',
      studentEmail: p.customer ? p.customer.email : '',
      studentId: p.customer ? p.customer.studentId : '',
      total: p.total,
      paymentMethod: p.paymentMethod,
      reference: p.payment && p.payment.reference ? p.payment.reference : '',
      verified: p.payment && p.payment.verified ? 'yes' : 'no',
      status: p.status,
      createdAt: p.createdAt,
      slipUrl: p.payment && (p.payment.slipUrl || p.payment.slipPath) ? (p.payment.slipUrl || (window.location.origin + p.payment.slipPath)) : ''
    }));

    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => `"${String((r as any)[h] ?? '')}"`).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_report_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const handleConfirm = async (orderOrId: any) => {
    // accept either order object or id
    let order: any = null;
    let id: string = '';
    if (typeof orderOrId === 'string') {
      id = orderOrId;
    } else if (orderOrId && typeof orderOrId === 'object') {
      order = orderOrId;
      id = order._id;
    }

    try {
      // if we don't have the order object, fetch it to inspect paymentMethod/reference
      if (!order) {
        const fetched = await adminOrderService.getOrder(id);
        if (fetched && fetched.success) order = fetched.order;
      }

      // determine if we should ask for a reference/receipt (bank or cash without a recorded reference)
      const pm = String(order?.paymentMethod || '').toLowerCase();
      let referenceChecked: string | null = null;
      if ((pm === 'bank' || pm === 'cash') && !(order?.payment && order.payment.reference)) {
        const ref = window.prompt('Enter payment reference / receipt number (leave empty if none):', '');
        if (ref === null) return; // cancelled
        referenceChecked = String(ref).trim() || null;
      }

      if (!confirm('Confirm payment and mark order as completed?')) return;

      const payload: any = { complete: true };
      if (referenceChecked) payload.referenceChecked = referenceChecked;

      const res = await adminOrderService.confirmPayment(id, payload);
      if (res && res.success) {
        toast.success('Payment confirmed');
        loadPayments();
      } else {
        toast.error(res.message || 'Failed to confirm');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error confirming payment');
    }
  };
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Management
        </h1>
        <p className="text-gray-600">Track payments and revenue</p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <DollarSignIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs. {totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">{totalRevenue > 0 ? `Avg LKR ${averagePayment.toLocaleString()}` : 'No payments yet'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">This Month</p>
            <TrendingUpIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs. {thisMonthRevenue.toLocaleString()}</p>
          <p className="text-sm text-blue-600 mt-1">{payments.length} payments</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Pending Payments</p>
            <CreditCardIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingPaymentsCount}</p>
          <p className="text-sm text-yellow-600 mt-1">awaiting verification</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Average Payment</p>
            <DollarSignIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs. {averagePayment.toLocaleString()}</p>
        </motion.div>
      </div>
      {/* Revenue Chart */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => exportPaymentsCSV()} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <DownloadIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `Rs. ${Number(v).toLocaleString()}`} />
            <Tooltip formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Payments</h2>
          <div className="relative w-64">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search payments..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && <tr><td colSpan={6} className="px-6 py-4 text-sm text-gray-500">Loading...</td></tr>}
              {!loading && payments.filter(p => {
                const q = searchQuery.trim().toLowerCase();
                if (!q) return true;
                return (p._id && String(p._id).toLowerCase().includes(q)) || (p.customer && p.customer.name && p.customer.name.toLowerCase().includes(q)) || (p.items && p.items.some((it:any) => it.name && it.name.toLowerCase().includes(q)));
              }).map((order, index) => (
                <motion.tr key={order._id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><span className="font-mono text-sm">{order._id}</span></td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.customer ? order.customer.name : (order.user || '—')}</p>
                      <p className="text-sm text-gray-500">{order.customer ? order.customer.email : ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="font-semibold">LKR {order.total}</span></td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{order.paymentMethod}</div>
                    {order.payment && order.payment.reference && <div className="text-xs text-gray-500">Ref: {order.payment.reference}</div>}
                  </td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.status === 'completed' ? 'bg-green-100 text-green-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{order.status}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Cash Payments */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Cash Payments</h2>
          <p className="text-sm text-gray-500">Payments received in cash that need verification</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reference</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.filter(p => (p.paymentMethod && String(p.paymentMethod).toLowerCase().includes('cash'))).map((p, idx) => (
                <tr key={p._id || idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><span className="font-mono text-sm">{p._id}</span></td>
                  <td className="px-6 py-4"><div className="font-medium">{p.customer ? p.customer.name : '—'}</div><div className="text-xs text-gray-500">{p.customer ? p.customer.studentId || p.customer.email : ''}</div></td>
                  <td className="px-6 py-4"><span className="font-semibold">LKR {p.total}</span></td>
                  <td className="px-6 py-4">{p.payment && p.payment.reference ? <span className="text-sm text-gray-700">{p.payment.reference}</span> : <span className="text-sm text-gray-400">—</span>}</td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-900">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {(!p.payment || !p.payment.verified) && <button onClick={() => handleConfirm(p)} className="px-3 py-1 text-sm bg-green-600 text-white rounded">Confirm</button>}
                      {p.payment && p.payment.verified && <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">Verified</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payments */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Online Payments</h2>
          <p className="text-sm text-gray-500">Payments made through online gateways that need verification</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Transaction</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.filter(p => (p.paymentMethod && String(p.paymentMethod).toLowerCase() === 'online')).map((p, idx) => (
                <tr key={p._id || idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><span className="font-mono text-sm">{p._id}</span></td>
                  <td className="px-6 py-4"><div className="font-medium">{p.customer ? p.customer.name : '—'}</div><div className="text-xs text-gray-500">{p.customer ? p.customer.studentId || p.customer.email : ''}</div></td>
                  <td className="px-6 py-4"><span className="font-semibold">LKR {p.total}</span></td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {p.payment && (p.payment.transactionId || p.payment.txnId || p.payment.reference)
                        ? <span>{p.payment.transactionId || p.payment.txnId || p.payment.reference}</span>
                        : <span className="text-sm text-gray-400">—</span>}
                      {p.payment && (p.payment.provider || p.payment.gateway) && (
                        <div className="text-xs text-gray-500">{p.payment.provider || p.payment.gateway}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-900">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {(!p.payment || !p.payment.verified) && <button onClick={() => handleConfirm(p)} className="px-3 py-1 text-sm bg-green-600 text-white rounded">Confirm</button>}
                      {p.payment && p.payment.verified && <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">Verified</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submitted Bank Slips */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Submitted Bank Slips</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reference</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slip</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.filter(p => (p.payment && p.payment.slipUrl) || (p.paymentMethod && String(p.paymentMethod).toLowerCase().includes('bank'))).map((p, idx) => (
                <tr key={p._id || idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><span className="font-mono text-sm">{p._id}</span></td>
                  <td className="px-6 py-4"><div className="font-medium">{p.customer ? p.customer.name : '—'}</div><div className="text-xs text-gray-500">{p.customer ? p.customer.studentId || p.customer.email : ''}</div></td>
                  <td className="px-6 py-4">{p.payment && p.payment.reference ? <span className="text-sm text-gray-700">{p.payment.reference}</span> : <span className="text-sm text-gray-400">—</span>}</td>
                  <td className="px-6 py-4">{p.payment && (p.payment.slipUrl || p.payment.slipPath) ? <a className="text-blue-600 underline" href={p.payment.slipUrl || (window.location.origin + p.payment.slipPath)} target="_blank" rel="noreferrer">View slip</a> : <span className="text-sm text-gray-400">No slip</span>}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {(!p.payment || !p.payment.verified) && <button onClick={() => handleConfirm(p)} className="px-3 py-1 text-sm bg-green-600 text-white rounded">Confirm</button>}
                      {p.payment && p.payment.verified && <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">Verified</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}