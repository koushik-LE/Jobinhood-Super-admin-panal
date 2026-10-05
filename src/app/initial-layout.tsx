'use client';
import HeroLeftSection from '@/components/constant/HeroLeftSection';
import type { ReactNode } from 'react';
import React from 'react';

const InitialLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white20 dark:bg-black max-h-screen overflow-hidden">
    {/* Left Section */}
    <div className="hidden lg:block lg:w-1/2 max-h-[100vh]">
      <HeroLeftSection />
    </div>

    {/* Right Section */}
    <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white20 dark:bg-black p-8 lg:p-12 max-h-[100vh] overflow-hidden">
      {children}
    </div>
  </div>
);

export default InitialLayout;
