import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { authService } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        
        await authService.signUp(email, password);
        setSuccess('Account created successfully! Please check your email to verify your account before signing in.');
        setMode('verify');
      } else if (mode === 'signin') {
        await authService.signIn(email, password);
        onAuthSuccess();
        onClose();
      }
    } catch (err: any) {
      if (err.message.includes('verify your email')) {
        setMode('verify');
        setError(err.message);
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await authService.resendVerification(email);
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'verify') => {
    setMode(newMode);
    if (newMode !== 'verify') {
      resetForm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'verify' && 'Verify Email'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
              <CheckCircle size={18} className="mr-2" />
              {success}
            </div>
          )}

          {mode === 'verify' ? (
            <div className="text-center">
              <div className="mb-4">
                <Mail className="mx-auto text-indigo-600" size={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Check Your Email
              </h3>
              <p className="text-gray-600 mb-4">
                We've sent a verification link to <strong>{email}</strong>. 
                Please click the link in your email to verify your account.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Didn't receive the email? Check your spam folder or click below to resend.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <RefreshCw size={18} className="animate-spin mr-2" />
                  ) : (
                    <Mail size={18} className="mr-2" />
                  )}
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                
                <button
                  onClick={() => switchMode('signin')}
                  className="w-full text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Confirm your password"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}

          {mode !== 'verify' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-indigo-600 hover:text-indigo-700 text-sm"
                disabled={loading}
              >
                {mode === 'signin' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          )}

          {mode !== 'verify' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Email verification is required to access premium features and sync your data across devices.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;