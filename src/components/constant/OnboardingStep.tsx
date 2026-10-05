import React from 'react';

interface OnboardingStepProps {
  text: string; // The text to display in the ribbon
  bgGradient: string; // Tailwind class for gradient background
  textColor: string; // Tailwind class for text color
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({ text, bgGradient, textColor }) => (
  <div className="relative">
    <div
      className={`flex items-center justify-center h-10 w-[240px] font-medium text-base relative ${bgGradient} ${textColor}`}
      style={{
        clipPath:
          'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)',
      }}
    >
      <span className="px-8">{text}</span>
    </div>
  </div>
);

export default OnboardingStep;
