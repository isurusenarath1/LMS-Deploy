import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

export default function OTPModal({ email, onClose, onVerified, previewUrl }: { email: string; onClose: () => void; onVerified?: () => void; previewUrl?: string }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [preview, setPreview] = useState<string | undefined>(previewUrl);

  useEffect(() => {
    // start cooldown timer when modal mounts or when previewUrl changes (new send)
    setResendEnabled(false);
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          setResendEnabled(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [email, previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.verifyOtp(email, code);
      if (res && res.success) {
        if (onVerified) onVerified();
        onClose();
      } else {
        setError(res.message || 'Invalid code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!resendEnabled) return;
    setResending(true);
    setError(null);
    try {
      const r = await authService.resendOtp(email);
      if (r && r.previewUrl) setPreview(r.previewUrl);
      // restart cooldown
      setResendEnabled(false);
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            clearInterval(timer);
            setResendEnabled(true);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Resend failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg"
      >
        <h3 className="text-lg font-semibold mb-2">Enter verification code</h3>
        <p className="text-sm text-gray-600 mb-4">We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-full px-3 py-3 border rounded text-lg tracking-widest text-center"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          {preview && <div className="text-sm mt-1">Dev preview: <a className="text-blue-600 underline" target="_blank" rel="noreferrer" href={preview}>{preview}</a></div>}
          <div className="flex items-center justify-between">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
            <div className="flex items-center gap-2">
              <button type="button" disabled={!resendEnabled || resending} onClick={handleResend} className="px-3 py-2 rounded border text-sm disabled:opacity-50">
                {resending ? 'Sending...' : (resendEnabled ? 'Send Again' : `Wait ${countdown}s`)}
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{loading ? 'Verifying...' : 'Verify'}</button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
