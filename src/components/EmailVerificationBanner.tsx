import React, { useState } from 'react';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';
import { authService } from '../lib/auth';

interface EmailVerificationBannerProps {
  user: any;
  userProfile: any;
  onClose: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  user, 
  userProfile, 
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      await authService.resendVerification(user.email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if email is already verified
  if (authService.isEmailVerified(user, userProfile)) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Mail className="text-yellow-600 mr-3" size={20} />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Email Verification Required
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please verify your email address to access premium features and sync your data across devices.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {success ? (
            <div className="flex items-center text-green-600">
              <CheckCircle size={16} className="mr-1" />
              <span className="text-sm">Email sent!</span>
            </div>
          ) : (
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="bg-yellow-600 text-white py-1 px-3 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin mr-1" />
              ) : (
                <Mail size={14} className="mr-1" />
              )}
              {loading ? 'Sending...' : 'Resend Email'}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;