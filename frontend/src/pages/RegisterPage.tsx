import React, { useState, useEffect } from 'react';
import settingsService from '../services/settingsService';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlusIcon, MailIcon, LockIcon, PhoneIcon, CreditCardIcon, BadgeIcon, UserIcon } from 'lucide-react';
import OTPModal from '../components/OTPModal';
import { authService } from '../services/authService';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    nic: '',
    badge: 'Bronze'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPreviewUrl, setOtpPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const res = await settingsService.getSettings();
        if (res && res.success) setSiteSettings(res.settings);
      } catch (e) {}
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return;
    setLoading(true);
    const res = await authService.register(formData);
    setLoading(false);
    if (res && res.success) {
      if (res.needsOtp) {
        setShowOtp(true);
        setOtpEmail(formData.email);
        if ((res as any).previewUrl) setOtpPreviewUrl((res as any).previewUrl);
      } else {
        window.location.href = '/';
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Registration Form */}
      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600 mb-8">Join PPP Physics today</p>
          </motion.div>
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIC</label>
              <div className="relative">
                <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" name="nic" value={formData.nic} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2 disabled:opacity-50">
              <UserPlusIcon className="w-5 h-5" />
              {loading ? 'Creating Account...' : 'Register'}
            </motion.button>
          </motion.form>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 text-center">
            <p className="text-gray-600">Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login here</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
      {showOtp && <OTPModal email={otpEmail} previewUrl={otpPreviewUrl} onClose={() => setShowOtp(false)} onVerified={() => { window.location.href = '/'; }} />}
      {/* Right Side - Image */}
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-700 items-center justify-center p-12">
        <div className="text-center text-white">
          <motion.img initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} src={siteSettings && siteSettings.registerBg ? siteSettings.registerBg : 'https://github.com/isurusenarath1/Assets-for-portfolio/blob/main/reset-password.jpg?raw=true'} alt="Physics Education" className="rounded-2xl shadow-2xl mb-8" />
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-4xl font-bold">Start Your Journey</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-xl mt-4">Master physics with expert guidance</motion.p>
        </div>
      </motion.div>
    </div>
  );
}