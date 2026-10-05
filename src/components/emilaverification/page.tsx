'use client';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setOtpSeledObject, setSelectedEmail } from '@/redux/constSlice';
import { showToast } from '../constant/custom-toast';

interface FormData {
  email: string;
}

interface ResetPasswordComponentProps {
  onBack: () => void; // Define the prop type
}

const ResetPasswordComponent: React.FC<ResetPasswordComponentProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>({ email: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      showToast('error', 'Please enter the email');
      return;
    }

    setLoading(true);
    dispatch(setSelectedEmail(formData.email));
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date());
    try {
      const response = await fetch('/api/auth/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        showToast('success', '✅ OTP sent Successful', 'Please check your email!');
        router.push('/otpVerification');
      } else {
        showToast('error', 'Invalid Email', `Attempted at ${formattedTime}`);
      }
    } catch {
      alert('Something went wrong!');
      showToast('error', 'Email Verification Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className=" dark:text-white p-6 sm:p-8 rounded-lg w-full max-w-md sm:max-w-lg"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          className="text-left mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl font-bold"
          style={{
            fontFamily: 'Poppins, sans-serif',
            textUnderlinePosition: 'from-font',
            textDecorationSkipInk: 'none',
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Forgot Password
        </motion.h2>

        <form onSubmit={handleSubmit}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 font-poppins mb-2"
          >
            Email Id <span className="text-red-500">*</span>
          </motion.p>

          <motion.div
            className="mb-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Your Email Id"
              className="w-full p-4 sm:p-5 md:p-6 border border-gray-300 dark:border-gray-700 rounded-md text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </motion.div>

          <motion.button
            type="submit"
            className="w-full sm:w-[20rem] bg-gradient-to-r from-[#F02AF3] to-[#7B2FFF] text-white py-2 sm:py-3 rounded-md disabled:opacity-50"
            disabled={loading}
            whileHover={{
              scale: 1.05,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {loading ? 'Loading...' : 'Send Mail'}
          </motion.button>

          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <button
              type="button"
              className="text-sm sm:text-base text-white hover:underline"
              onClick={() => onBack()}
            >
              Already have an account? <span className="text-[#F02AF3]">Sign In</span>
            </button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ResetPasswordComponent;
