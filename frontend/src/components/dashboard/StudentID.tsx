import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { DownloadIcon, CreditCardIcon, MailIcon, CalendarIcon } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { toast } from 'sonner';
export default function StudentID() {
  const {
    user
  } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrSize, setQrSize] = useState(200);

  useEffect(() => {
    function updateSize() {
      const w = window.innerWidth;
      if (w < 360) setQrSize(120);
      else if (w < 420) setQrSize(140);
      else if (w < 640) setQrSize(160);
      else setQrSize(200);
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await toBlob(cardRef.current);
      if (blob) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        const idPart = (user?.nic?.toString().trim()) || (user?.studentId?.toString().trim()) || String(user?.id || '').slice(-6) || 'id';
        link.download = `student-id-${idPart}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Student ID downloaded successfully!');
      }
    } catch (error) {
      toast.error('Failed to download Student ID');
      console.error('Download error:', error);
    }
  };
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  // compute identifier to encode in QR
  const idValueRaw = user?.nic ?? user?.studentId ?? user?.id ?? '';
  const idValue = idValueRaw ? String(idValueRaw).trim() : '';

  return <div className="max-w-4xl mx-auto w-full px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student ID Card</h1>
          <p className="text-gray-600 mt-1">
            Your digital student identification
          </p>
        </div>
        <button onClick={handleDownload} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition">
          <DownloadIcon className="w-5 h-5" />
          <span>Download ID</span>
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8">
        <div ref={cardRef} className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden max-w-full box-border">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-white rounded-full -translate-y-20 sm:-translate-y-32 translate-x-20 sm:translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 sm:w-48 sm:h-48 bg-white rounded-full translate-y-12 sm:translate-y-24 -translate-x-12 sm:-translate-x-24"></div>
          </div>
          {/* Card Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-2xl">P</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">PPP Physics</h2>
                  <p className="text-blue-100 text-sm">
                    Student Identification
                  </p>
                </div>
              </div>
              <CreditCardIcon className="w-8 h-8 text-blue-200" />
            </div>
            {/* Student Info and QR Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {/* Left Side - Student Information */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                    {user?.profilePicture ? <img src={user.profilePicture} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-blue-600 font-bold text-3xl sm:text-4xl">{user?.name ? user.name.charAt(0) : 'S'}</span>}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">{user?.name}</h3>
                    <p className="text-blue-100">Student</p>
                  </div>
                </div>
                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <CreditCardIcon className="w-4 h-4" />
                    </div>
                      <div>
                        <p className="text-blue-100 text-sm">Student ID</p>
              <p className="font-bold text-lg">{user?.nic || user?.studentId || '—'}</p>
                      </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <MailIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Member Since</p>
                      <p className="font-medium">{joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Side - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-2xl transform scale-75 sm:scale-90 md:scale-100">
                  {/* QR encodes the identifier (NIC or studentId). If missing, show a placeholder message instead of an empty QR. */}
                  {idValue ? (
                    <QRCodeSVG value={idValue} size={qrSize} level="H" includeMargin={true} />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400">No ID available</div>
                  )}
                </div>
                <p className="text-blue-100 text-sm mt-4 text-center">
                  Scan to verify student identity
                </p>
              </div>
            </div>
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white border-opacity-20">
              <div className="flex justify-between items-center text-sm">
                <p className="text-blue-100">Valid for current academic year</p>
                <p className="text-blue-100">
                  Issued: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            How to use your Student ID
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>
                Use this ID to verify your identity at PPP Physics classes and
                events
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Download and save the ID card for offline access</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>
                The QR code can be scanned by instructors for quick verification
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>
                Keep your Student ID secure and do not share it with others
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>;
}