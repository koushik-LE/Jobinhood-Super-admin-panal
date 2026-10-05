import formatNumber from '@/lib/number-format';
import { useEffect, useState } from 'react';

type AnimatedNumebrProps = { value: number; textClass?: string };
const AnimatedNumber = ({ value, textClass = 'text-xl' }: AnimatedNumebrProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startValue = 0;
    const duration = 1500; // Duration of animation in milliseconds
    const totalFrames = 60; // Total number of animation frames
    const stepTime = duration / totalFrames; // Time per frame
    const increment = value / totalFrames; // Increment per frame

    const timer = setInterval(() => {
      startValue = Math.min(startValue + increment, value); // Ensure it doesn't exceed the target value
      setDisplayValue(Math.floor(startValue)); // Set the display value
      if (startValue >= value) {
        clearInterval(timer); // Clear the timer when target value is reached
      }
    }, stepTime);

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, [value]);

  return (
    <div className={`${textClass} font-bold`} title={`${value}`}>
      {formatNumber(displayValue)}
    </div>
  );
};

export default AnimatedNumber;
