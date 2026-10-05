'use client';
import InitialLayout from './initial-layout';
import LoginComponent from '@/components/LoginComponent';
import { useState } from 'react';
import ResetPasswordComponent from '@/components/emilaverification/page';

export default function Home() {
  const [isResetPassword, setIsResetPassword] = useState(false);

  return (
    <InitialLayout>
      <div className="relative w-full h-full flex items-center justify-center ">
        {/* <AnimatePresence mode="wait"> */}
        <div
          key={isResetPassword ? 'reset-password' : 'login'}
          // initial="hidden"
          // animate="visible"
          // exit="exit"
          // variants={formVariants}
          // transition={{ duration: 0.5, type: 'spring' }} // Smooth transition effect
          className="relative w-full max-w-md" // Ensure form stays on the right half
        >
          {isResetPassword ? (
            <ResetPasswordComponent onBack={() => setIsResetPassword(false)} />
          ) : (
            <LoginComponent onResetPasswordClick={() => setIsResetPassword(true)} />
          )}
        </div>
        {/* </AnimatePresence> */}
      </div>
    </InitialLayout>
  );
}
