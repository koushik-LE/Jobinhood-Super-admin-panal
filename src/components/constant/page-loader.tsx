'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
// import logo from '../assets/logo.png'
export default function PageLoader() {
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    const texts = [
      'Securing connection',
      'Encrypting data',
      'Verifying access',
      'Initializing dashboard',
    ];
    let currentTextIndex = 0;
    let currentCharIndex = 0;

    const textInterval = setInterval(() => {
      if (currentTextIndex >= texts.length) {
        currentTextIndex = 0;
      }

      if (currentCharIndex < texts[currentTextIndex].length) {
        setLoadingText(texts[currentTextIndex].substring(0, currentCharIndex + 1));
        currentCharIndex++;
      } else {
        setTimeout(() => {
          currentTextIndex++;
          currentCharIndex = 0;
          setLoadingText('');
        }, 1000); // Pause before starting the next text
      }
    }, 100);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className="fixed inset-0  flex flex-col items-center justify-center z-50 overflow-hidden bg-opacity-50 bg-geay-500 dark:bg-black dark:bg-opacity-50">
      <div className="relative w-28 h-28 mb-8">
        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src="" alt="Logo" className="h-28 w-auto block dark:bg-white rounded-full z-10" />
        </div>
        {/* Pulsating effect */}
        <div className="absolute inset-0 bg-brand-dark rounded-full opacity-30 animate-ping" />
        {/* Rotating circles */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 border-2 border-brand-dark rounded-full"
            style={{
              animation: `spin ${6 + i * 2}s linear infinite`,
              borderRadius: '50%',
              borderRightColor: 'transparent',
              borderLeftColor: 'transparent',
              transform: `rotate(${i * 45}deg)`,
            }}
          />
        ))}
      </div>
      <div className="text-brand text-2xl font-bold mb-4 h-8">
        {loadingText}
        <span className="animate-pulse">|</span>
      </div>

      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden z-[-1]">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-brand-dark opacity-10 rounded-full"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
