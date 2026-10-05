import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';

const TableSkeleton = ({ rowCount = 11, colCount = 10, className = '' }) => {
  const rows = Array.from({ length: rowCount });
  const columns = Array.from({ length: colCount });

  return (
    <Card className={`p-3 shadow-md w-full overflow-x-auto ${className}`}>
      <div className="w-full">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {columns.map((_, index) => (
                <th key={index} className="px-4 py-2">
                  <Skeleton className="h-6 w-full min-w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-2">
                    <Skeleton className="h-6 w-full " />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TableSkeleton;
