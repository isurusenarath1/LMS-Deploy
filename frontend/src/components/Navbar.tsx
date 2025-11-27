import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, BookOpenIcon, ShoppingCartIcon, UserIcon, LogOutIcon, ChevronDownIcon, MenuIcon, XIcon, SendIcon, BellIcon, PlayIcon, ShoppingBagIcon } from 'lucide-react';
import logo from '../assets/ppplogo';
import { toast } from 'sonner';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../context/CartContext';
import notificationService from '../services/notificationService';
export default function Navbar() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOthersMenu, setShowOthersMenu] = useState(false);
  const [showClassesMenu, setShowClassesMenu] = useState(false);
  const [batchesList, setBatchesList] = useState<any[]>([]);
  
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCartMenu, setShowCartMenu] = useState(false);
  const cart = useCart();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const yearBadges = [{
    year: '2026',
    color: 'from-blue-500 to-blue-600'
  }, {
    year: '2027',
    color: 'from-purple-500 to-purple-600'
  }, {
    year: '2028',
    color: 'from-pink-500 to-pink-600'
  }];

  // load classes for dropdown
  const loadBatchesDropdown = async () => {
    try {
      const batchSvc = await import('../services/batchService');
      const res = await batchSvc.getBatches();
      // normalize response shape and only include Active batches
      let items: any[] = []
      if (Array.isArray(res)) items = res
      else if (res && Array.isArray(res.batches)) items = res.batches
      else if (res && Array.isArray(res.data)) items = res.data
      // filter only active
      items = items.filter((b: any) => (b?.status || 'Active') === 'Active')
      setBatchesList(items.slice(0, 6))
    } catch (err) {
      console.error('Load batches dropdown error', err);
    }
  };

  // (courses preview removed from navbar dropdown)

  // load courses for All Courses section (show admin-updated courses)
  const loadCoursesDropdown = async () => {
    try {
      const courseSvc = await import('../services/courseService');
      const res = await courseSvc.getCourses();
      const items = Array.isArray(res) ? res : (res && Array.isArray(res.courses) ? res.courses : []);
      if (items.length > 0) {
        // prefer most recently updated/created courses
        const sorted = items.slice().sort((a: any, b: any) => {
          const ta = a.updatedAt || a.createdAt || 0;
          const tb = b.updatedAt || b.createdAt || 0;
          return new Date(tb).getTime() - new Date(ta).getTime();
        });
        setCoursesList(sorted.slice(0, 6));
      } else {
        setCoursesList([]);
      }
    } catch (err) {
      console.error('Load courses dropdown error', err);
    }
  };

  // fetch on mount and when classes updated
  useEffect(() => {
  loadBatchesDropdown();
  const batchHandler = () => loadBatchesDropdown();
  window.addEventListener('batches-updated', batchHandler as EventListener);
  loadNotifications();
  return () => {
    window.removeEventListener('batches-updated', batchHandler as EventListener);
  };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    try {
      const res: any = await notificationService.getMyNotifications();
      if (res && res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications.slice(0, 50));
      }
    } catch (err) {
      console.error('loadNotifications error', err);
    }
  };

  const handleOpenNotification = async (notif: any) => {
    try {
      if (!notif.isRead) {
        await notificationService.markNotificationRead(notif._id || notif.id);
        // update state optimistically
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      // optional: navigate to a notifications page or open details
    } catch (err) {
      console.error('mark read error', err);
    }
  };
  return <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="PPP Physics" className="w-10 h-10 object-cover rounded-lg" />
            <span className="text-xl font-bold text-gray-800">PPP PHYSICS</span>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
            {/* Batches Dropdown with Year Batches */}
            <div className="relative">
              <button onClick={async () => {
                await loadBatchesDropdown();
                await loadCoursesDropdown();
                setShowClassesMenu(prev => !prev);
              }} className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
                <BookOpenIcon className="w-5 h-5" />
                <span>Batches</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showClassesMenu && <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -10
              }} className="absolute top-full mt-2 w-80 bg-white rounded-lg shadow-lg py-2 border border-gray-100 max-h-96 overflow-y-auto">
                    {/* show a few recent batches */}
                    {batchesList && batchesList.length > 0 ? <div className="px-2 py-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">Batches</p>
                        {batchesList.map(b => (
                          <Link key={b._id} to={`/batch/${b.year}/months`} className="block px-2 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setShowClassesMenu(false)}>
                            <div className="text-sm font-medium">{b.year} Batch</div>
                            <div className="text-xs text-gray-400">{b.title || ''}</div>
                          </Link>
                        ))}
                      </div> : <div className="px-4 py-2">
                        <p className="text-sm text-gray-500">No batches yet</p>
                      </div>}
                    <div className="border-t border-gray-100 my-2"></div>
                  </motion.div>}
              </AnimatePresence>
            </div>
            {/* Cart */}
            <div className="relative">
              <button onClick={() => setShowCartMenu(prev => !prev)} className="relative text-gray-700 hover:text-blue-600 transition">
                <ShoppingCartIcon className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.count}
                </span>
              </button>
              <AnimatePresence>
                {showCartMenu && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg py-3 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Cart</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {cart.items.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">Cart is empty</div>
                      ) : (
                        cart.items.map(item => (
                          <div key={item.monthId} className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                            <div>
                              <div className="font-medium text-gray-800">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.batchYear}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-semibold text-gray-900">{item.price ? `LKR ${item.price}` : 'Free'}</div>
                              <IconButton onClick={() => { cart.removeItem(item.monthId); toast.success('Removed from cart'); }} size="small" aria-label="remove from cart" title="Remove from cart">
                                <DeleteIcon fontSize="small" className="text-red-600" />
                              </IconButton>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-600">Total</div>
                        <div className="font-semibold">LKR {cart.total}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { cart.clear(); setShowCartMenu(false); }} className="flex-1 px-3 py-2 border rounded text-sm">Clear</button>
                        <button onClick={() => { setShowCartMenu(false); window.location.href = '/checkout'; }} className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded text-sm">Checkout</button>
                      </div>
                    </div>
                  </motion.div>}
              </AnimatePresence>
            </div>
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-gray-700 hover:text-blue-600 transition">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>}
              </button>
              <AnimatePresence>
                {showNotifications && <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -10
              }} className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg py-2 border border-gray-100 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">
                        Notifications
                      </h3>
                    </div>
                    {notifications.map((notification: any) => <div key={notification._id || notification.id} onClick={() => handleOpenNotification(notification)} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                        <p className="font-medium text-gray-800 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                        </p>
                      </div>)}
                    <div className="px-4 py-3 border-t border-gray-100">
                      <Link to="/dashboard/notifications" className="text-sm text-blue-600 hover:text-blue-800" onClick={() => setShowNotifications(false)}>
                        View all notifications
                      </Link>
                    </div>
                  </motion.div>}
              </AnimatePresence>
            </div>
            {/* Others Dropdown */}
            <div className="relative">
              <button onClick={() => setShowOthersMenu(!showOthersMenu)} className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition">
                <span>Others</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showOthersMenu && <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -10
              }} className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                    <Link to="/telegram" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setShowOthersMenu(false)}>
                      <div className="flex items-center space-x-2">
                        <SendIcon className="w-4 h-4" />
                        <span>Telegram Channels</span>
                      </div>
                    </Link>
                    <Link to="/privacy-policy" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setShowOthersMenu(false)}>
                      Privacy Policy
                    </Link>
                    <Link to="/terms-conditions" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setShowOthersMenu(false)}>
                      Terms & Conditions
                    </Link>
                    <Link to="/contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setShowOthersMenu(false)}>
                      Contact Us
                    </Link>
                  </motion.div>}
              </AnimatePresence>
            </div>
            {/* User Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.profilePicture ? <img src={user.profilePicture} alt="avatar" className="w-8 h-8 object-cover rounded-full" /> : <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">{user?.name ? user.name.charAt(0) : 'U'}</div>}
                </div>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showUserMenu && <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -10
              }} className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      {(user?.nic || user?.studentId) && <p className="text-xs text-gray-400 mt-1">
                          ID: {user.nic || user.studentId}
                        </p>}
                    </div>
                    <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                      <UserIcon className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    {user?.role === 'admin' && <Link to="/admin" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setShowUserMenu(false)}>
                        <UserIcon className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>}
                    <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full">
                      <LogOutIcon className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>}
              </AnimatePresence>
            </div>
          </div>
          {/* Mobile Menu Button */}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-gray-700">
            {showMobileMenu ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} className="md:hidden border-t border-gray-100 py-4">
              <Link to="/" className="block py-2 text-gray-700 hover:text-blue-600">
                Home
              </Link>
              {/* Classes link removed from mobile menu */}
              <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link to="/telegram" className="block py-2 text-gray-700 hover:text-blue-600">
                Telegram Channels
              </Link>
              <Link to="/privacy-policy" className="block py-2 text-gray-700 hover:text-blue-600">
                Privacy Policy
              </Link>
              <Link to="/terms-conditions" className="block py-2 text-gray-700 hover:text-blue-600">
                Terms & Conditions
              </Link>
              <Link to="/contact" className="block py-2 text-gray-700 hover:text-blue-600">
                Contact Us
              </Link>
              <button onClick={handleLogout} className="block py-2 text-red-600 hover:text-red-700 w-full text-left">
                Logout
              </button>
            </motion.div>}
        </AnimatePresence>
      </div>
    </nav>;
}