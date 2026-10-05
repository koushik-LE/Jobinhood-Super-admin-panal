'use client';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../constant/custom-toast';

// Define the shape of your redux state for selector typing
interface RootState {
  constantReducer: {
    selectedEmail: string;
  };
}

interface FormData {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordProps {
  onResetPasswordClick?: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = () => {
  const [formData, setFormData] = useState<FormData>({
    confirmPassword: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const router = useRouter();

  // Typed selector instead of any
  const Email = useSelector((state: RootState) => state.constantReducer.selectedEmail);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear specific error message on input change
  };

  const dispatch = useDispatch();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newErrors: { password?: string; confirmPassword?: string } = {};

    // Field validation
    if (!formData.password) {
      newErrors.password = 'Please enter password!';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please enter confirm password!';
    }
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = 'Passwords do not match!';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setErrors({}); // Clear errors if everything is valid

    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date());

    try {
      const response = await fetch('/api/auth/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: formData.password,
          email: Email,
        }),
      });

      if (response.ok) {
        showToast('success', '✅ Password Changed Successfully', 'Please Login!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        showToast('error', '🚫 Reset Failed', `Attempted at ${formattedTime}`);
        router.push('/dashboard');
      }
    } catch {
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex justify-center items-center min-h-screen"
      style={{
        fontFamily: 'Poppins, sans-serif',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 dark:text-white p-8 rounded-lg w-full max-w-3xl"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          className="text-left mb-6"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '32px',
            fontWeight: 800,
            lineHeight: '44.8px',
            textUnderlinePosition: 'from-font',
            textDecorationSkipInk: 'none',
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Create New Password
        </motion.h2>

        <form onSubmit={handleSubmit}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm text-gray-600 dark:text-gray-400 font-poppins text-[18px] font-normal leading-[32px] tracking-[-0.02em] text-left"
          >
            Password <span className="text-red-500">*</span>
          </motion.p>

          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Your Password"
              className="w-full p-6 border border-gray-300 dark:border-gray-700 rounded-md text-black dark:text-black placeholder-gray-400 dark:placeholder-gray-500"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm text-gray-600 dark:text-gray-400 font-poppins text-[18px] font-normal leading-[32px] tracking-[-0.02em] text-left"
          >
            Confirm Password <span className="text-red-500">*</span>
          </motion.p>

          <motion.div
            className="relative mb-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Input
              type={passwordVisible ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Enter Your Confirm Password"
              className="w-full p-6 border border-gray-300 dark:border-gray-700 rounded-md text-black dark:text-black placeholder-gray-400 dark:placeholder-gray-500"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}

            <button
              type="button"
              className={`absolute right-4 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-all duration-200 ${
                errors.confirmPassword ? 'top-[40%]' : 'top-1/2'
              }`}
              onClick={() => setPasswordVisible(prev => !prev)}
            >
              {passwordVisible ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </button>
          </motion.div>

          <motion.button
            type="submit"
            className="w-[24rem] bg-blue10 text-white p-3 rounded-md disabled:bg-blue-300 dark:bg-blue-700"
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
            {loading ? 'Loading...' : 'Reset Password'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ResetPassword;
