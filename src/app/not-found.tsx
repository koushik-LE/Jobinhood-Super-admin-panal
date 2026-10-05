'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, RefreshCw } from 'lucide-react';
import DashboardLayout from './dashboard-layout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Custom404() {
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const router = useRouter();

  // Rotate the astronaut slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Float the astronaut in space
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: 5 * Math.sin(Date.now() / 1000),
        y: 5 * Math.cos(Date.now() / 1500),
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);
  const handleNavigation = (page: string) => {
    if (page === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.back(); // Correct way to go back
    }
  };

  return (
    <DashboardLayout>
      <div className=" flex flex-col items-center bg-[#f5f3f3] dark:bg-gradient-to-b dark:from-black dark:to-slate-900 text-black dark:text-white p-4">
        <div className="max-w-screen w-full text-center relative">
          {/* Stars background */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-black dark:bg-white"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  opacity: Math.random() * 0.8 + 0.2,
                  animation: `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          {/* 404 Text */}
          <h1 className="text-9xl font-bold mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 dark:from-brand-dark dark:to-brand-accent animate-pulse">
            404
          </h1>

          {/* Astronaut */}
          <div
            className="relative mx-auto w-40 h-40 mb-8"
            style={{
              transform: `translateX(${position.x}px) translateY(${position.y}px)`,
            }}
          >
            <div
              className="absolute inset-0 bg-gray-300 dark:bg-slate-800 rounded-full border-4 border-gray-400 dark:border-slate-700 flex items-center justify-center"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="relative w-20 h-28">
                {/* Astronaut helmet */}
                <div className="absolute top-0 w-16 h-16 bg-gray-500 dark:bg-slate-200 rounded-full left-1/2 -translate-x-1/2 overflow-hidden">
                  <div className="absolute top-4 left-4 w-8 h-8 bg-gray-800 dark:bg-slate-900 rounded-full opacity-70" />
                </div>
                {/* Astronaut body */}
                <div className="absolute top-12 w-20 h-16 bg-gray-300 dark:bg-white rounded-lg" />
                {/* Astronaut backpack */}
                <div className="absolute top-14 -left-2 w-6 h-10 bg-gray-400 dark:bg-slate-300 rounded" />
                {/* Astronaut arms */}
                <div className="absolute top-14 -right-4 w-8 h-4 bg-gray-300 dark:bg-white rounded-full" />
                <div className="absolute top-20 -left-4 w-8 h-4 bg-gray-300 dark:bg-white rounded-full" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            Houston, we have a problem!
          </h2>
          <div className="text-gray-600 dark:text-slate-300 mb-8">
            The page you're looking for has drifted off into space or never existed in the first
            place.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 mt-6 rounded bg-brand-dark hover:bg-brand-dark/90 text-white z-10 relative"
              onClick={() => handleNavigation('dashboard')}
            >
              <Home className="h-4 w-4" />
              Return Home
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 mt-6 rounded bg-brand-dark hover:bg-brand-dark/90 text-white z-10 relative"
              onClick={() => router.back()} // This correctly navigates back
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
