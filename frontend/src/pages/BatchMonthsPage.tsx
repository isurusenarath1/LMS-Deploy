import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as monthService from '../services/monthService';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const BatchMonthsPage: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  const navigate = useNavigate();
  const [months, setMonths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolledMonthIds, setEnrolledMonthIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (!year) return;
    setLoading(true);
    monthService.getMonths(year)
      .then(res => setMonths(res.months || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [year]);

  useEffect(() => {
    let mounted = true;
    const loadEnrolled = async () => {
      if (!user) return setEnrolledMonthIds(new Set());
      try {
        const res: any = await orderService.getMyOrders();
        const orders = res && res.success && Array.isArray(res.orders) ? res.orders : [];
        const ids = new Set<string>();
        orders.forEach((o: any) => {
          const ok = (o.status === 'completed') || (o.payment && (o.payment.complete === true || o.payment.verified === true));
          if (ok && Array.isArray(o.items)) {
            o.items.forEach((it: any) => { if (it && it.monthId) ids.add(String(it.monthId)); });
          }
        });
        if (mounted) setEnrolledMonthIds(ids);
      } catch (err) {
        console.error('Failed to load enrolled months', err);
        if (mounted) setEnrolledMonthIds(new Set());
      }
    };
    loadEnrolled();
    return () => { mounted = false };
  }, [user]);

  const cart = useCart();

  const openMonth = (m: any) => {
    navigate(`/batch/${year}?month=${m._id}`);
  };

  const buyMonth = (m: any) => {
    const item = {
      id: `${m._id}`,
      name: `${m.name} - ${m.title || ''}`,
      batchYear: year || '',
      monthId: m._id,
      price: m.price || 0,
      currency: m.currency || 'LKR'
    }
    cart.addItem(item)
    navigate('/checkout')
  }

  const addToCart = (m: any) => {
    const item = {
      id: `${m._id}`,
      name: `${m.name} - ${m.title || ''}`,
      batchYear: year || '',
      monthId: m._id,
      price: m.price || 0,
      currency: m.currency || 'LKR'
    }
    cart.addItem(item)
    toast.success('Added to cart')
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-lg font-bold">{year} Batch</div>
            <div className="text-gray-600">{months.length} months</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{year} — Months</h1>
        </div>

        {loading && <div className="text-sm text-gray-500">Loading months...</div>}
        {!loading && months.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-600">No months found for this batch.</p>
          </div>
        )}

        {!loading && months.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {months.slice(0, 12).map(m => {
              const inCart = cart.items.some(i => i.monthId === m._id)
              const isEnrolled = enrolledMonthIds.has(String(m._id))
              const isFree = !(m.price && m.price > 0)

              return (
                <article
                  key={m._id}
                  onClick={() => {
                    // only allow opening month details if user is enrolled or month is free
                    if (isEnrolled || isFree) {
                      openMonth(m)
                    } else {
                      // navigate to months listing where purchase controls are available
                      navigate(`/batch/${year}/months`)
                    }
                  }}
                  role="button"
                  aria-label={`Open ${m.name} details`}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (isEnrolled || isFree) openMonth(m); else navigate(`/batch/${year}/months`) } }}
                  className="relative bg-white border border-gray-100 rounded-lg p-5 hover:shadow-xl hover:-translate-y-1 transform transition-shadow cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 leading-snug">{m.name}</h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{m.title || ''}</p>
                      <div className="mt-3 text-sm text-gray-600">{m.duration || m.lessons ? `${m.duration || ''} ${m.lessons ? `• ${m.lessons} lessons` : ''}` : ''}</div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      {isFree ? (
                        <span className="inline-block text-sm font-medium px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">Free</span>
                      ) : (
                        <span className="inline-block text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-800">LKR {m.price}</span>
                      )}
                    </div>
                  </div>

                  <footer className="mt-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="text-xs text-gray-500">{m.startDate ? new Date(m.startDate).toLocaleDateString() : ''}</div>

                    <div className="flex items-center gap-2">
                      {isEnrolled ? (
                        <button
                          onClick={() => openMonth(m)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-500 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                          aria-label={`View classes for ${m.name}`}
                        >
                          View Classes
                        </button>
                      ) : isFree ? (
                        <>
                          <button
                            onClick={() => buyMonth(m)}
                            className="px-4 py-2 border border-green-600 text-green-600 rounded-md text-sm bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-200"
                            aria-label={`Enroll free in ${m.name}`}
                          >
                            Enroll Free
                          </button>
                          <button
                            onClick={() => addToCart(m)}
                            disabled={inCart}
                            className={`px-3 py-2 border rounded-md text-sm ${inCart ? 'opacity-60 cursor-not-allowed' : ''}`}
                            aria-label={`Add ${m.name} to cart`}
                          >
                            {inCart ? 'In cart' : 'Add to cart'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => buyMonth(m)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            aria-label={`Buy ${m.name} now`}
                          >
                            Buy Now
                          </button>
                          <button
                            onClick={() => addToCart(m)}
                            disabled={inCart}
                            className={`px-3 py-2 border rounded-md text-sm ${inCart ? 'opacity-60 cursor-not-allowed' : ''}`}
                            aria-label={`Add ${m.name} to cart`}
                          >
                            {inCart ? 'In cart' : 'Add to cart'}
                          </button>
                        </>
                      )}
                    </div>
                  </footer>
                </article>
              )
            })}
          </div>
        )}

        {months.length > 12 && (
          <div className="mt-6 text-sm text-gray-500">Showing first 12 months (4x3). Use admin to manage more.</div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BatchMonthsPage;
