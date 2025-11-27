import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { toast } from 'sonner';

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    orderService.getMyOrders()
      .then((res) => {
        if (res && res.success) {
          setOrders(res.orders || []);
        } else {
          toast.error(res.message || 'Failed to load orders');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error loading orders');
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  async function copyOrderId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Order ID copied');
    } catch (err) {
      console.error('copy failed', err);
      toast.error('Failed to copy');
    }
  }

  function statusBadge(status: string) {
    const s = String(status || '').toLowerCase();
    if (s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (s === 'cancelled' || s === 'failed') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">My Orders</h2>
        <div className="text-sm text-gray-600">{loading ? 'Loading...' : `${orders.length} order${orders.length === 1 ? '' : 's'}`}</div>
      </div>
      {loading && <div className="text-sm text-gray-500 mb-4">Loading...</div>}
      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-gray-600">You have not placed any orders yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map(o => (
          <div key={o._id} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="font-medium">Order <span className="font-mono text-sm ml-2">{String(o._id).slice(0,8)}...</span></div>
                  <button onClick={() => copyOrderId(o._id)} className="text-xs text-gray-500 hover:text-gray-700">Copy ID</button>
                  <button onClick={() => toggleExpand(o._id)} className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded">{expanded[o._id] ? 'Hide' : 'Details'}</button>
                </div>
                <div className="text-xs text-gray-500 mt-1">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${statusBadge(o.status)}`}>{o.status}</div>
                <div className="text-lg font-bold mt-2">LKR {o.total}</div>
              </div>
            </div>

            {expanded[o._id] && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Customer</div>
                  <div className="font-medium">{o.customer ? o.customer.name : '—'}</div>
                  <div className="text-xs text-gray-500">{o.customer ? o.customer.email : ''}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Payment</div>
                  <div className="font-medium">{o.paymentMethod}</div>
                  {o.payment && o.payment.reference && <div className="text-xs text-gray-500">Ref: {o.payment.reference}</div>}
                  {o.payment && o.payment.slipUrl && <a href={o.payment.slipUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">View slip</a>}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Items</div>
                  <div className="mt-2 space-y-1 text-sm">
                    {o.items && o.items.map((it: any) => (
                      <div key={it.monthId || it.id} className="flex items-center justify-between">
                        <div>{it.name}</div>
                        <div className="font-medium">{it.price ? `LKR ${it.price}` : 'Free'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
