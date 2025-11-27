import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, UsersIcon, VideoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import * as monthService from '../../services/monthService';

export default function MyClasses() {
  const [months, setMonths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const myOrdersRes: any = await orderService.getMyOrders();
        const orders = myOrdersRes && myOrdersRes.success && Array.isArray(myOrdersRes.orders) ? myOrdersRes.orders : [];

        // collect enrolled month ids from orders where payment completed/verified or status completed
        const enrolledMonthIds = new Set<string>();
        orders.forEach((o: any) => {
          const ok = (o.status === 'completed') || (o.payment && (o.payment.complete === true || o.payment.verified === true));
          if (ok && Array.isArray(o.items)) {
            o.items.forEach((it: any) => { if (it && it.monthId) enrolledMonthIds.add(String(it.monthId)); });
          }
        });

        if (enrolledMonthIds.size === 0) {
          if (mounted) setMonths([]);
          return;
        }

        // fetch month details
        const monthPromises = Array.from(enrolledMonthIds).map(id => monthService.getMonth(id).then((r: any) => r && (r.month || r)).catch(() => null));
        const fetchedMonths = (await Promise.all(monthPromises)).filter(Boolean) as any[];

        if (mounted) setMonths(fetchedMonths);
      } catch (err) {
        console.error('Failed to load enrolled months', err);
        if (mounted) setMonths([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Classes</h1>
        <p className="text-gray-600">Track your enrolled classes and progress</p>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading classes...</div>}

      {!loading && months.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-600">You haven't enrolled in any months yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!loading && months.map((m: any, index: number) => {
          const title = m.title || m.name || 'Month';
          const desc = m.description || '';
          const price = m.price || 0;
          const image = m.image || `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRINkz9dZuGyFHyflBdo4ulT4mDcoFdxfe-PQ&s`;

          return (
            <motion.div key={m._id || index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
              <img src={image} alt={title} className="w-full h-44 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{desc}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-700 font-semibold">{price > 0 ? `LKR ${price}` : 'Free'}</div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/batch/${m.batchYear}?month=${m._id}`)} className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-500 text-white rounded">View Classes</button>
                    <button onClick={() => navigate(`/batch/${m.batchYear}/months`)} className="px-3 py-2 border rounded text-sm">View Batch</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
}