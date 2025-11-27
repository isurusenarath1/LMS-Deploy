import React, { useState, useEffect } from 'react';
import settingsService from '../services/settingsService';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogInIcon, MailIcon, LockIcon } from 'lucide-react';
import OTPModal from '../components/OTPModal';
import { authService } from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
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
    setLoading(true);
    // clear previous error
    setError(null);
    // Call authService directly so we can handle OTP flow in the page
    try {
      const res = await authService.login(email, password);
      setLoading(false);
      if (res && res.success) {
        if (res.needsOtp) {
          setShowOtp(true);
          setOtpEmail(email);
          if ((res as any).previewUrl) setOtpPreviewUrl((res as any).previewUrl);
        } else {
          // token already set by authService; redirect to home
          window.location.href = '/';
        }
      } else {
        // show backend message or a generic auth error
        setError((res && res.message) ? res.message : 'Email or password is incorrect');
      }
    } catch (err) {
      setLoading(false);
      setError('Unable to contact server. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Image */}
      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-12">
        <div className="text-center text-white">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-6xl font-bold mb-6">
            PPP PHYSICS
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-2xl">
            Plan. Prepare. Perform.
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="mt-12">
            <img src={siteSettings && siteSettings.loginBg ? siteSettings.loginBg : 'https://github.com/isurusenarath1/Assets-for-portfolio/blob/main/reset-password.jpg?raw=true'} alt="Physics Learning" className="rounded-2xl shadow-2xl" />
          </motion.div>
        </div>
      </motion.div>

      {showOtp && <OTPModal email={otpEmail} previewUrl={otpPreviewUrl} onClose={() => setShowOtp(false)} onVerified={() => { window.location.href = '/'; }} />}

      {/* Right Side - Login Form */}
      <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-8">Login to continue your physics journey</p>
          </motion.div>
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-3 border border-red-100">
                <div className="flex items-start gap-3">
                  <div className="text-red-600 font-semibold">Error</div>
                  <div className="text-red-700">{error}</div>
                  <button onClick={() => setError(null)} className="ml-auto text-sm text-gray-500">Dismiss</button>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(null); }} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="student@gmail.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(null); }} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="••••••••" required />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center justify-center gap-2 disabled:opacity-50">
              <LogInIcon className="w-5 h-5" />
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </motion.form>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 text-center">
            <p className="text-gray-600">Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}