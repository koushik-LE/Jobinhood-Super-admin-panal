import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';

interface CardSkeletonProps {
  color?: string;
  chartHeight?: string;
  chartWidth?: string;
  showRightButton?: boolean;
  showHeading?: boolean;
  showDescription?: boolean;
  skeletonHeight?: string;
  className?: string; // additional class name for custom styles or overrides in the parent component. For example, 'w-48' for a 48px wide card.
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  color = 'bg-gray-300 dark:bg-gray-700',
  chartHeight = 'h-48',
  chartWidth = 'w-full',
  skeletonHeight = 'h-full',
  showRightButton = false,
  showHeading = true,
  showDescription = true,
  className = '',
}) => (
  <Card className={`p-2 shadow-md w-full relative ${className}`}>
    {showRightButton && (
      <div className="absolute top-2 right-2">
        <Skeleton className={`h-4 w-10 ${color}`} />
      </div>
    )}
    <div>
      <div>
        {showHeading && (
          <h2 className="text-lg font-semibold mb-1">
            <Skeleton className={`h-6 w-1/2 ${color}`} />
          </h2>
        )}
        {showDescription && (
          <div className="text-sm font-semibold text-slate-400 mb-2">
            <Skeleton className={`h-4 w-3/4 ${color}`} />
          </div>
        )}
      </div>
      <div />
    </div>

    <div className={`${chartHeight} ${chartWidth}`}>
      <Skeleton className={`h-full w-full ${color}`} />
    </div>
  </Card>
);

export default CardSkeleton;
