import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { QrCodeIcon, CameraIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import * as adminService from '../../services/adminService';

let QrScanner: any = null;

export default function AdminScanQR() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastRaw, setLastRaw] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<string | null>(null);

  useEffect(() => {
    // dynamically import to avoid bundling issues until feature used
    (async () => {
      try {
        const mod = await import('qr-scanner');
        QrScanner = (mod as any).default || (mod as any);
        // worker path - ensure worker is resolved by bundler
        QrScanner.WORKER_PATH = new URL('qr-scanner/qr-scanner-worker.min.js', import.meta.url).toString();
      } catch (err) {
        console.warn('QR Scanner import failed', err);
      }
    })();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanResult = async (result: any) => {
    if (!result && result !== 0) return;
    // Normalize result to a string. Some scanner callbacks may send an object.
    let rawResult: string;
    if (typeof result === 'string') {
      rawResult = result;
    } else if (result && typeof result === 'object') {
      // common fields to check
      rawResult = (result.data || result.text || result.rawValue || result.value || JSON.stringify(result));
    } else {
      rawResult = String(result);
    }
    if (!rawResult) return;
    // QR payloads may be prefixed; try to parse nic/studentId from the value
    let payload = rawResult;
    try {
      // if colon-delimited like "PREFIX:IDENTIFIER"
      if (result.includes(':')) {
        payload = result.split(':').pop() || result;
      }
    } catch (e) {
      // ignore
    }

  setLastRaw(String(rawResult));
  console.debug('QR raw result:', rawResult);
    payload = payload ? String(payload).trim() : '';
    if (!payload) {
      setError('QR did not contain an identifier');
      toast.error('QR did not contain an identifier');
      return;
    }

    // avoid re-processing while a scan is being handled
    if (processing) return;
    // avoid repeated identical payloads
    if (lastProcessed && lastProcessed === payload) return;
    setProcessing(true);
    setLastProcessed(payload);

    // Try verify by NIC first, then studentId
    setError(null);
    try {
      const res = await adminService.verifyStudent({ nic: payload, studentId: payload });
      if (res && res.success) {
        // stop scanning after a successful verification to avoid repeated hits
        await stopScanner();
        setScanResult(res.student);
        toast.success(res.message || 'Student verified');
      } else {
        // allow retrying when verification fails
        setScanResult(null);
        setError(res?.message || 'Verification failed');
        toast.error(res?.message || 'Verification failed');
        // unlock processing after short delay so scanner can try again
        setTimeout(() => setProcessing(false), 800);
      }
    } catch (err: any) {
      setError('Server error during verification');
      if (err?.message) console.error(err.message);
      toast.error('Server error during verification');
      setTimeout(() => setProcessing(false), 800);
    } finally {
      // ensure processing unlock if verification succeeded or stopped
      setProcessing(false);
    }
  };

  const startScanner = async () => {
    if (!QrScanner) {
      toast.error('QR Scanner not available. Please ensure the dependency is installed.');
      return;
    }
    setError(null);
    setScanResult(null);
    try {
      if (videoRef.current) {
        scannerRef.current = new QrScanner(videoRef.current, (res: any) => handleScanResult(res), {
          highlightScanRegion: true,
          highlightCodeOutline: true
        });
        await scannerRef.current.start();
        setScanning(true);
        setProcessing(false);
        setLastProcessed(null);
      }
    } catch (err) {
      console.error('Start scanner error', err);
      setError('Unable to start camera. Check permissions.');
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    } catch (err) {
      // ignore
    }
    setScanning(false);
    setProcessing(false);
  };

  const handleManualVerify = async () => {
    const value = manualInput ? manualInput.trim() : '';
    if (!value) {
      toast.error('Enter NIC or Student ID');
      return;
    }
    setError(null);
    setScanResult(null);
    try {
      const res = await adminService.verifyStudent({ nic: value, studentId: value });
      if (res && res.success) {
        setScanResult(res.student);
        toast.success(res.message || 'Student verified');
      } else {
        setError(res?.message || 'Verification failed');
        toast.error(res?.message || 'Verification failed');
      }
    } catch (err) {
      setError('Server error during verification');
      toast.error('Server error during verification');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan Student QR Codes</h1>
        <p className="text-gray-600">Verify student identity and attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">QR Scanner</h2>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-6">
            <div className="w-full h-full relative">
              <video ref={videoRef} className="w-full h-full object-cover rounded-lg" />
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <QrCodeIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Position QR code within the frame</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            {!scanning ? (
              <button onClick={startScanner} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
                <CameraIcon className="w-5 h-5" />
                <span>Start Scanning</span>
              </button>
            ) : (
              <button onClick={stopScanner} className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
                <XCircleIcon className="w-5 h-5" />
                <span>Stop</span>
              </button>
            )}
            <div className="flex-1" />
          </div>
          {lastRaw && <div className="text-xs text-gray-500 mt-2">Raw QR payload: {lastRaw}</div>}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Start Scanning" to activate the camera</li>
              <li>• Position the student's QR code in the frame</li>
              <li>• Wait for automatic verification</li>
              <li>• You can also enter NIC / Student ID manually to verify</li>
            </ul>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Verification Result</h2>

          <div className="mb-4">
            <label className="text-sm text-gray-600">Manual NIC / Student ID</label>
            <div className="flex gap-3 mt-2">
              <input value={manualInput} onChange={(e) => setManualInput(e.target.value)} className="flex-1 border px-3 py-2 rounded-lg" placeholder="Enter NIC or Student ID" />
              <button onClick={handleManualVerify} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Verify</button>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
          {/* show server HTTP status if available */}
          {scanResult && (scanResult.status && <div className="mb-2 text-sm text-gray-500">Server status: {scanResult.status}</div>)}

          {scanResult ? (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Verified Student</h3>
                <p className="text-gray-600">Identity confirmed successfully</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Student ID</label>
                  <p className="font-semibold text-gray-900">{scanResult.studentId}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="font-semibold text-gray-900">{scanResult.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-semibold text-gray-900">{scanResult.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">NIC</label>
                  <p className="font-semibold text-gray-900">{scanResult.nic || '—'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Verified At</label>
                  <p className="font-semibold text-gray-900">{new Date(scanResult.idVerifiedAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Mark Attendance</button>
                <button onClick={async () => { setScanResult(null); setError(null); setLastProcessed(null); await startScanner(); }} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">Scan Another</button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <QrCodeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No scan result yet</p>
              <p className="text-sm text-gray-400 mt-2">Scan a student QR code or enter NIC to verify</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}