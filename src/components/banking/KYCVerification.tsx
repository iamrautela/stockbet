import React, { useState } from 'react';
import { X, Upload, FileText, CreditCard, User, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface KYCVerificationProps {
  userId: string;
  onClose: () => void;
  onComplete: () => void;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({ userId, onClose, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [documentData, setDocumentData] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('KYC documents submitted!');
      onComplete();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">KYC Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload PAN Card</label>
            <input
              type="file"
              className="w-full text-gray-300"
              required
              onChange={e => setDocumentData({ ...documentData, pan: e.target.files?.[0] })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload Aadhaar Card</label>
            <input
              type="file"
              className="w-full text-gray-300"
              required
              onChange={e => setDocumentData({ ...documentData, aadhaar: e.target.files?.[0] })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit KYC'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default KYCVerification;