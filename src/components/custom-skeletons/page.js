// components/SkeletonCard.jsx
import React from 'react';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4">
    <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        {/* Example skeleton lines */}
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
