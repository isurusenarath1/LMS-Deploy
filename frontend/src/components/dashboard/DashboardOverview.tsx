import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpenIcon, ClipboardCheckIcon, TrophyIcon, CalendarIcon, ArrowRightIcon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import batchService from '../../services/batchService';
import classService from '../../services/classService';
import monthService from '../../services/monthService';
import { toast } from 'sonner';
import orderService from '../../services/orderService';

export default function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [userClassesState, setUserClassesState] = useState<any[] | null>(null);
  const [myOrders, setMyOrders] = useState<any[] | null>(null);
  const [enrolledMonthClasses, setEnrolledMonthClasses] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [allClsRes, batchRes, myClsRes, myOrdersRes] = await Promise.all([classService.getClasses(), batchService.getBatches(), classService.getMyClasses(), orderService.getMyOrders()]);
        // classService.getClasses returns an array
        setClasses(Array.isArray(allClsRes) ? allClsRes : []);
        setBatches(Array.isArray(batchRes) ? batchRes : (batchRes && Array.isArray(batchRes.batches) ? batchRes.batches : []));
        // myClsRes shape: { success: true, classes: [...] } or array fallback
        if (myClsRes) {
          if (myClsRes.success && Array.isArray(myClsRes.classes)) {
            setUserClassesState(myClsRes.classes);
          }
        }
        if (myOrdersRes && myOrdersRes.success && Array.isArray(myOrdersRes.orders)) {
          setMyOrders(myOrdersRes.orders);

          // derive enrolled monthIds and fetch month details to map to batch years and classes
          try {
            const orders = myOrdersRes.orders;
            const enrolledMonthIds = new Set<string>();
            orders.forEach((o: any) => {
              const ok = (o.status === 'completed') || (o.payment && (o.payment.complete === true || o.payment.verified === true));
              if (ok && Array.isArray(o.items)) {
                o.items.forEach((it: any) => { if (it && it.monthId) enrolledMonthIds.add(String(it.monthId)); });
              }
            });

            if (enrolledMonthIds.size > 0) {
              // fetch months and derive batch years
              const monthPromises = Array.from(enrolledMonthIds).map(id => monthService.getMonth(id).then((r: any) => r && (r.month || r)).catch(() => null));
              const months = (await Promise.all(monthPromises)).filter(Boolean) as any[];
              const batchYears = Array.from(new Set(months.map(m => String(m.batchYear).trim()).filter(Boolean)));

              const allClasses = Array.isArray(allClsRes) ? allClsRes : (allClsRes && Array.isArray(allClsRes.classes) ? allClsRes.classes : []);
              const matched: any[] = [];
              const seen = new Set<string>();
              allClasses.forEach((c: any) => {
                if (!c) return;
                if (batchYears.includes(String(c.year))) {
                  const id = String(c._id || c.id || JSON.stringify(c));
                  if (!seen.has(id)) {
                    seen.add(id);
                    matched.push(c);
                  }
                }
              });
              setEnrolledMonthClasses(matched);
            } else {
              setEnrolledMonthClasses([]);
            }
          } catch (err) {
            console.error('Failed to derive enrolled month classes', err);
            setEnrolledMonthClasses([]);
          }
        }
      } catch (err) {
        console.error('DashboardOverview load error', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // determine classes the current user is enrolled in
  const userId = (user as any)?.id || (user as any)?._id || '';
  const includesStudent = (students: any[] = [], uid: string) => {
    return students.some(s => {
      if (!s) return false;
      if (typeof s === 'string') return String(s) === String(uid);
      if (s._id) return String(s._id) === String(uid);
      return false;
    });
  };

  // get enrolled classes from backend result if available
  const userClasses: any[] = userClassesState && Array.isArray(userClassesState) ? userClassesState : classes.filter((c: any) => Array.isArray(c.students) && userId && includesStudent(c.students, userId));

  // compute study hours by parsing `duration` field (expects a number in hours in the string)
  const parseHours = (duration: string) => {
    if (!duration) return 0;
    // match numbers (e.g., '8 hours', '1.5 hr')
    const m = String(duration).match(/([0-9]+(?:\.[0-9]+)?)/);
    if (!m) return 0;
    return Number(m[1]);
  };

  const studyHours = userClasses.reduce((sum: number, c: any) => sum + (c.duration ? parseHours(c.duration) : 0), 0);

  // compute enrolled months from orders (count unique monthIds in completed orders)
  const enrolledMonthIds = new Set<string>();
  if (Array.isArray(myOrders)) {
    myOrders.forEach(o => {
      const ok = (o.status === 'completed') || (o.payment && (o.payment.complete === true || o.payment.verified === true));
      if (ok && Array.isArray(o.items)) {
        o.items.forEach((it: any) => {
          if (it.monthId) enrolledMonthIds.add(String(it.monthId));
        });
      }
    });
  }

  const stats = [{
    label: 'Enrole Months',
    value: String(enrolledMonthIds.size || 0),
    icon: BookOpenIcon,
    color: 'blue'
  }, {
    label: 'Study Hours',
    value: String(studyHours || 0),
    icon: ClockIcon,
    color: 'purple'
  }];

  // derive upcoming classes from the user's enrolled classes (with startDate in future)
  const upcoming = (enrolledMonthClasses && Array.isArray(enrolledMonthClasses) && enrolledMonthClasses.length > 0 ? enrolledMonthClasses : userClasses)
    .filter((c: any) => c.startDate && new Date(c.startDate) > new Date())
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  // determine related batch year (most common among user's classes, fallback to first batch)
  const batchYears = userClasses.map((c: any) => c.year).filter(Boolean);
  const batchYear = batchYears.length ? batchYears.sort((a: any, b: any) => batchYears.filter((y: any) => y === a).length - batchYears.filter((y: any) => y === b).length).slice(-1)[0] : (batches[0] ? batches[0].year : '');
  const relatedBatch = batches.find(b => String(b.year) === String(batchYear)) || null;

  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
        <p className="text-gray-600">Here's your learning progress overview</p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
        const Icon = stat.icon;
        return <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white p-6 rounded-xl shadow-md">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>;
      })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Classes</h2>
            <CalendarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {loading ? <div className="text-sm text-gray-500">Loading...</div> : upcoming.length === 0 ? <div className="text-sm text-gray-500">No upcoming classes</div> : upcoming.map((classItem, index) => <div key={classItem._id || index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpenIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{classItem.title}</h3>
                  <p className="text-sm text-gray-600">{classItem.startDate ? new Date(classItem.startDate).toLocaleString() : classItem.schedule || 'TBA'}</p>
                  <p className="text-xs text-gray-500 mt-1">Instructor: {classItem.teacher?.name || 'TBA'}</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400" />
              </div>)}
          </div>
        </motion.div>
      </div>
      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
        <h2 className="text-xl font-bold mb-4">Ready to continue learning?</h2>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => navigate('/dashboard/classes')} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition">Browse Classes</button>
          <button onClick={() => navigate('/dashboard/materials')} className="bg-white bg-opacity-20 text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-30 transition">View Materials</button>
        </div>
      </motion.div>
        {/* Related Batch Preview with Status sections */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Batch</h2>
          </div>
          {relatedBatch ? (() => {
            const batchClasses = classes.filter((c: any) => String(c.year) === String(relatedBatch.year));
            const now = new Date();
            const active = batchClasses.filter((c: any) => c.status === 'Active');
            const upcomingBatch = batchClasses.filter((c: any) => c.startDate && new Date(c.startDate) > now);
            const completed = batchClasses.filter((c: any) => c.status === 'Completed' || (c.startDate && new Date(c.startDate) < now && c.status !== 'Active'));
            return <div>
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Batch Year</p>
                <p className="text-2xl font-semibold text-gray-900">{relatedBatch.year}</p>
                {relatedBatch.title && <p className="text-sm text-gray-600 mt-1">{relatedBatch.title}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-white border rounded-lg">
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-lg font-semibold text-gray-900">{active.length}</p>
                  <div className="mt-2 text-xs text-gray-600">
                    {active.slice(0,3).map((c:any)=> <div key={c._id} className="py-1">{c.title}</div>)}
                  </div>
                </div>
                <div className="p-3 bg-white border rounded-lg">
                  <p className="text-sm text-gray-500">Upcoming</p>
                  <p className="text-lg font-semibold text-gray-900">{upcomingBatch.length}</p>
                  <div className="mt-2 text-xs text-gray-600">
                    {upcomingBatch.slice(0,3).map((c:any)=> <div key={c._id} className="py-1">{c.title} — {c.startDate ? new Date(c.startDate).toLocaleDateString() : ''}</div>)}
                  </div>
                </div>
                <div className="p-3 bg-white border rounded-lg">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-lg font-semibold text-gray-900">{completed.length}</p>
                  <div className="mt-2 text-xs text-gray-600">
                    {completed.slice(0,3).map((c:any)=> <div key={c._id} className="py-1">{c.title}</div>)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/batch/${relatedBatch.year}/months`)} className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">View Batch Months</button>
                <button onClick={() => navigate('/dashboard/classes')} className="px-4 py-2 border rounded-lg">View All Classes</button>
              </div>
            </div>;
          })() : <div className="text-sm text-gray-500">No related batch found</div>}
        </motion.div>
    </div>;
}