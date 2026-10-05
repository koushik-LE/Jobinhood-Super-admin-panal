'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import LoginComponent from '@/components/LoginComponent';
import { useState } from 'react';
import ResetPasswordComponent from '@/components/emilaverification/page';
import InitialLayout from '../initial-layout';
import OTPVerification from '@/components/OTP-verification-component/page';

export default function ResetPassword() {
  const [otpVerify, setOtpVerify] = useState(false);

  return (
    <InitialLayout>
      <div className="relative w-full h-full flex items-center justify-center ">
        {/* <AnimatePresence mode="wait"> */}
        <div
          key={otpVerify ? 'reset-password' : 'login'}
          // initial="hidden"
          // animate="visible"
          // exit="exit"
          // variants={formVariants}
          // transition={{ duration: 0.5, type: 'spring' }} // Smooth transition effect
          className="relative w-full max-w-md" // Ensure form stays on the right half
        >
          {otpVerify ? (
            <ResetPasswordComponent onBack={() => setOtpVerify(false)} />
          ) : (
            <OTPVerification onBack={() => setOtpVerify(true)} />
          )}
        </div>
        {/* </AnimatePresence> */}
      </div>
    </InitialLayout>
  );
}
