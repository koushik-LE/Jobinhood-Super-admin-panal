'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { showToast } from '../constant/custom-toast';
import type { AxiosError } from 'axios';
import axios from 'axios';
import type { RootState } from '@/redux/store';

interface OTPVerificationComponentProps {
  onBack?: () => void;
}

interface ErrorResponseData {
  [key: string]: unknown;
  error?: string;
  message?: string;
}

const OTPVerification: React.FC<OTPVerificationComponentProps> = ({ onBack }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();
  const Email = useSelector((state: RootState) => state?.constantReducer?.selectedEmail);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (error) {
      setError(null);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (pastedData.length <= 6 && /^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);

      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleResend = async () => {
    if (timeLeft !== 0) return;

    setIsResending(true);

    try {
      const response = await axios.post('/api/auth/GenerateOTP', {
        email: Email, // Assuming you're using Redux to get Email
      });

      showToast('success', '✅ OTP Sent Successfully', 'Please check your email!');

      setTimeLeft(30);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      const error = err as AxiosError;

      let errorMessage = 'Something went wrong.';

      if (error.response) {
        const data = error.response.data as ErrorResponseData;
        errorMessage = data.error || data.message || 'Email verification failed.';
      }

      showToast('error', '🚫 OTP Resend Failed', errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date());

    if (otpValue.length !== 6) {
      showToast('error', '❌ Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }

    try {
      const response = await axios.post('/api/auth/verify-otp', {
        otp: otpValue,
        email: Email,
      });

      showToast('success', '✅ OTP Verified Successfully', 'Redirecting to password reset...');

      router.push('/resetPassword');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;

      let errorMessage = 'Something went wrong.';

      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;

        errorMessage = data?.error || data?.message || 'OTP verification failed.';

        showToast(
          'error',
          '🚫 OTP Verification Failed',
          `${errorMessage} | Attempted at ${formattedTime}`
        );
      } else {
        showToast('error', '❌ Network Error', 'Please try again later.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-start justify-start gap-4 mb-6">
        <h2
          style={{
            fontFamily: 'Poppins',
            fontWeight: 400,
            fontSize: '30px',
            lineHeight: '140%',
            letterSpacing: '0px',
            color: '#1F2937',
          }}
        >
          Email Verification
        </h2>
        <p className="text-gray-500 text-left mt-2">
          Enter the 6-digit code sent to {'  '}
          <span className="font-medium text-gray-700 ">{Email}</span>
        </p>
        <div
          className="flex items-start justify-start text-left"
          style={{
            fontFamily: 'Poppins',
            fontWeight: 800,
            fontSize: '28px',
            lineHeight: '140%',
            letterSpacing: '0px',
          }}
        >
          Enter OTP
        </div>
      </div>

      <Card className="w-full max-w-md p-8 shadow-lg border-0 bg-white">
        <div className="flex justify-between gap-2 mb-6">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="relative w-full">
                <input
                  ref={el => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index]}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={cn(
                    'w-full h-14 text-center text-xl font-bold rounded-lg border-2 focus:ring-2 focus:ring-offset-1 transition-all',
                    'outline-none focus:outline-none',
                    otp[index]
                      ? 'border-[#F02AF3]/20 bg-[#F02AF3]/4 text-[#7B2FFF]'
                      : 'border-gray-200 text-gray-900',
                    error && 'border-red-500 bg-red-50'
                  )}
                  autoFocus={index === 0}
                />
              </div>
            ))}
        </div>

        {error && <div className="mb-4 text-center text-red-600 text-sm">{error}</div>}

        <Button
          onClick={handleVerify}
          disabled={otp.join('').length !== 6}
          className="w-full h-12 bg-gradient-to-r from-[#F02AF3] to-[#7B2FFF] text-white rounded-lg font-medium text-base hover:bg-blue10"
        >
          Verify
        </Button>
        <div className="mt-6 text-center">
          {timeLeft > 0 ? (
            <p className="text-gray-500">
              Resend code in <span className="text-[#F02AF3] font-medium">{timeLeft}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className={`font-medium transition-colors ${
                isResending ? 'text-black' : 'text-blue-600 hover:text-blue-800'
              }`}
              style={
                isResending
                  ? {
                      fontFamily: 'Poppins',
                      fontWeight: 400,
                      fontSize: '20px',
                      lineHeight: '140%',
                      letterSpacing: '0px',
                      textDecoration: 'underline',
                      textDecorationStyle: 'solid',
                      textDecorationThickness: '0%',
                      textDecorationSkipInk: 'auto',
                    }
                  : { textDecoration: 'underline', color: 'darkblue' }
              }
            >
              {isResending ? 'Sending...' : 'Resend the OTP'}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};
export default OTPVerification;
