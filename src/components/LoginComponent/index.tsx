'use client';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { showToast } from '../constant/custom-toast';
import axios from 'axios';
import { setLogedinUser } from '@/redux/constSlice';

interface FormData {
  email: string;
  password: string;
}

interface LoginComponentProps {
  onResetPasswordClick: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onResetPasswordClick }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date());

    try {
      const response = await axios.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Login response:', response);
      if (response.status === 200) {
        router.push('/dashboard');

        try {
          const response = await axios.post('/api/auth/logedInUser', {});
          dispatch(setLogedinUser(response.data.data));
        } catch {
          showToast('error', 'fetching user data failed');
        }
        showToast('success', '✅ Login Successful', 'Welcome back!');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Login error:', error);
          setError(
            error.response.data.message ||
              'The username or password you entered is incorrect. Please check your credentials and try again.'
          );
          showToast(
            'error',
            `🚫 ${error.response.data.error || 'Login Failed'}`,
            `Attempted at ${formattedTime}`
          );
        } else if (error.request) {
          setError('No response received from server. Please try again.');
          showToast('error', '🚫 Network Error', 'Please check your connection');
        } else {
          setError('An error occurred. Please try again.');
          showToast('error', '🚫 Request Error', 'Error setting up request');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
        showToast('error', '🚫 Unexpected Error', 'Please try again later');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen w-full px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm sm:max-w-md"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Heading */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-xs sm:text-sm tracking-wide text-gray-400 uppercase">
            Access the Jobinhood Super Admin Console
          </p>
        </motion.div>

        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg text-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <label className="block mb-2 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white">
            Enter Your User Name <span className="text-brand-accent">*</span>
          </label>
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your username"
              className={`w-full p-4 sm:p-5 bg-white/[0.03] border ${
                error ? 'border-red-500' : 'border-white/10'
              } rounded-xl text-white placeholder:text-gray-500 focus-visible:ring-brand-dark`}
            />
          </motion.div>

          {/* Password */}
          <label className="block mb-2 text-xs sm:text-sm font-semibold uppercase tracking-wide text-white">
            Enter Your Password <span className="text-brand-accent">*</span>
          </label>
          <motion.div
            className="relative mb-3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Input
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full p-4 sm:p-5 bg-white/[0.03] border ${
                error ? 'border-red-500' : 'border-white/10'
              } rounded-xl text-white placeholder:text-gray-500 focus-visible:ring-purple-500`}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
              onClick={() => setPasswordVisible(prev => !prev)}
            >
              {passwordVisible ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </motion.div>

          <div className="flex justify-end mb-8">
            <button
              type="button"
              className="text-sm font-medium text-brand hover:text-brand-dark/90 hover:underline transition"
              onClick={onResetPasswordClick}
            >
              Forgot your password?
            </button>
          </div>

          <motion.button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-brand-dark text-white font-semibold p-4 rounded-xl transition disabled:opacity-60 hover:shadow-[0_0_25px_rgba(240,42,243,0.4)]"
            disabled={loading}
            whileHover={{
              scale: 1.02,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                Login <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LoginComponent;
