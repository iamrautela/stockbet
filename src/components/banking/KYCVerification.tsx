import React, { useState } from 'react';
import { X, Upload, FileText, CreditCard, User, CheckCircle } from 'lucide-react';
import { bankingService } from '../../services/bankingService';
import toast from 'react-hot-toast';

interface KYCVerificationProps {
  userId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface DocumentUpload {
  type: 'aadhaar' | 'pan' | 'bank_statement';
  file: File | null;
  uploaded: boolean;
}

const KYCVerification: React.FC<KYCVerificationProps> = ({ userId, onClose, onComplete }) => {
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: 'aadhaar', file: null, uploaded: false },
    { type: 'pan', file: null, uploaded: false },
    { type: 'bank_statement', file: null, uploaded: false }
  ]);
  const [loading, setLoading] = useState(false);

  const documentInfo = {
    aadhaar: {
      title: 'Aadhaar Card',
      description: 'Upload clear photo of your Aadhaar card (front and back)',
      icon: <User className="h-6 w-6" />
    },
    pan: {
      title: 'PAN Card',
      description: 'Upload clear photo of your PAN card',
      icon: <CreditCard className="h-6 w-6" />
    },
    bank_statement: {
      title: 'Bank Statement',
      description: 'Upload recent bank statement (last 3 months)',
      icon: <FileText className="h-6 w-6" />
    }
  };

  const handleFileUpload = (type: 'aadhaar' | 'pan' | 'bank_statement', file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size should be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed');
      return;
    }

    setDocuments(prev => prev.map(doc => 
      doc.type === type ? { ...doc, file, uploaded: true } : doc
    ));
  };

  const handleSubmit = async () => {
    const uploadedDocs = documents.filter(doc => doc.uploaded);
    
    if (uploadedDocs.length !== 3) {
      toast.error('Please upload all required documents');
      return;
    }

    setLoading(true);
    
    try {
      const documentData = uploadedDocs.map(doc => ({
        type: doc.type,
        file: doc.file,
        name: doc.file?.name,
        size: doc.file?.size,
        uploadedAt: new Date().toISOString()
      }));

      const result = await bankingService.submitKYCDocuments(userId, documentData);
      
      if (result.success) {
        toast.success('KYC documents submitted successfully!');
        onComplete();
      } else {
        toast.error(result.error || 'Failed to submit KYC documents');
      }
    } catch (error) {
      toast.error('An error occurred while submitting documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">KYC Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="text-sm text-blue-400">
            <strong>Why KYC?</strong> KYC verification is mandatory for financial transactions as per RBI guidelines. 
            It helps us ensure the security of your account and comply with regulatory requirements.
          </div>
        </div>

        <div className="space-y-6">
          {documents.map((doc) => {
            const info = documentInfo[doc.type];
            return (
              <div key={doc.type} className="bg-gray-700 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-emerald-400">
                    {info.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{info.title}</h3>
                      {doc.uploaded && (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4">
                      {info.description}
                    </p>

                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(doc.type, file);
                            }
                          }}
                          className="hidden"
                        />
                        <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">
                            {doc.uploaded ? 'Change File' : 'Upload File'}
                          </span>
                        </div>
                      </label>

                      {doc.uploaded && doc.file && (
                        <div className="text-sm text-gray-300">
                          {doc.file.name} ({(doc.file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || documents.some(doc => !doc.uploaded)}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Verification typically takes 24-48 hours</p>
          <p>You'll be notified via email once your KYC is approved</p>
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;