'use client';

import InventoryDynamicChart from '@/components/constant/recurment-chart';
import DashboardLayout from '../dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FilterButton from '@/components/constant/filter-button';
import { motion } from 'framer-motion';

const getDateRange = (days: number) => {
  const today = new Date();
  const toDate = today.toISOString().split('T')[0];
  const fromDate = new Date(today.setDate(today.getDate() - days)).toISOString().split('T')[0];

  return { fromDate, toDate };
};

interface MapData {
  [country: string]: number;
}

const chartData: MapData = {
  'United States': 250528,
  Germany: 15937,
  India: 13740,
  'The Netherlands': 3318,
  Sweden: 2762,
  China: 2454,
  'United Kingdom': 1467,
  Panama: 688,
  Bulgaria: 643,
  Poland: 199,
  'South Korea': 198,
  France: 180,
  Ukraine: 96,
  Canada: 86,
  Singapore: 68,
  'Hong Kong': 54,
  Australia: 46,
  Indonesia: 38,
  Japan: 22,
  Russia: 20,
  'United Arab Emirates': 12,
  Austria: 4,
  Tunisia: 2,
};

const rangeNames: { [key: number]: string } = {
  0: 'Today',
  1: 'Yesterday',
  7: 'Last 7 Days',
  30: 'Last 30 Days',
  90: 'Last 3 Months',
};
const forDays: number = 7;

const DEFAULT_DATE = {
  ...getDateRange(forDays),
  isDefault: true,
};
const DATE_RANGES: string[] = [
  'Yesterday',
  'Today',
  'Last 7 Days',
  'Last 30 Days',
  'Last 3 Months',
];

const DEFAULT_DATE_DISPLAY_NAME = rangeNames[forDays] || `Last ${forDays} Days`;

const StatCard = ({
  title,
  value,
  change,
  isPositive,
}: {
  title: string;
  value: number;
  change: string;
  isPositive: boolean;
}) => (
  <Card className="transition-all duration-300 p-2 ease-in-out hover:shadow-xl rounded-2xl bg-[#0f1720] border border-[#27272f]">
    <CardContent className="p-6 space-y-2">
      <h2 className="text-sm text-[#c7c7d3] font-medium">{title}</h2>
      <p className="text-3xl font-bold text-white">{Intl.NumberFormat().format(value)}</p>
      <div
        className={`flex items-center gap-2 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}
      >
        {isPositive ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
        <span>{change}</span>
        <span className="ml-2 text-[#97a0b5]">Since Last Month</span>
      </div>
    </CardContent>
  </Card>
);

const LEGEND_ITEMS = [
  { label: 'Search Engine', color: '#6C3CE9' },
  { label: 'Direct', color: '#2FD69E' },
  { label: 'Email', color: '#F5A623' },
];

const DashboardPage = () => {
  const searchParams = useSearchParams();

  const isValidDate = (date: string | null): boolean => date !== null && !isNaN(Date.parse(date));

  const getRelevantDate = (): { from: string; to: string; isDefault: boolean } => {
    const today = new Date();
    const fromDateParam = searchParams.get('fromDate');
    const toDateParam = searchParams.get('toDate');

    if (fromDateParam && toDateParam) {
      const fromDate = isValidDate(fromDateParam) ? fromDateParam : DEFAULT_DATE.fromDate;
      const toDate = isValidDate(toDateParam) ? toDateParam : DEFAULT_DATE.toDate;

      const isInvalidRange =
        new Date(fromDate) > today ||
        new Date(toDate) > today ||
        new Date(fromDate) > new Date(toDate);

      const isDefault =
        isInvalidRange || (fromDate === DEFAULT_DATE.fromDate && toDate === DEFAULT_DATE.toDate);

      return {
        from: isDefault ? DEFAULT_DATE.fromDate : fromDate,
        to: isDefault ? DEFAULT_DATE.toDate : toDate,
        isDefault,
      };
    }
    return { from: DEFAULT_DATE.fromDate, to: DEFAULT_DATE.toDate, isDefault: true };
  };

  const [dateFilter, setDateFilter] = useState<{ from: string; to: string; isDefault?: boolean }>(
    getRelevantDate()
  );

  const updateDateQueryParams = (dateRange?: { fromDate: string; toDate: string }) => {
    const url = new URL(window.location.href);
    if (dateRange && dateRange.fromDate && dateRange.toDate) {
      url.searchParams.set('fromDate', dateRange.fromDate);
      url.searchParams.set('toDate', dateRange.toDate);
    } else {
      url.searchParams.delete('fromDate');
      url.searchParams.delete('toDate');
    }
    window.history.pushState({}, '', url.toString());
  };

  const applyDateRange = (range: { fromDate: string; toDate: string }) => {
    setDateFilter({ from: range.fromDate, to: range.toDate });
    updateDateQueryParams(range);
  };

  const handleResetDate = () => {
    updateDateQueryParams({ fromDate: '', toDate: '' });
    setDateFilter({ from: DEFAULT_DATE.fromDate, to: DEFAULT_DATE.toDate });
  };

  return (
    <DashboardLayout>
      <div className="w-full mt-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-sm text-[#97a0b5] mt-1">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center space-x-2">
              {[0, 1, 7, 90].map(d => {
                const label = rangeNames[d] || (d === 90 ? '3 Month' : `Last ${d} Days`);
                const isActive =
                  (d === 0 &&
                    dateFilter.isDefault === false &&
                    dateFilter.from === getDateRange(0).fromDate &&
                    dateFilter.to === getDateRange(0).toDate) ||
                  (d === 1 && dateFilter.from === getDateRange(1).fromDate);
                return (
                  <button
                    key={d}
                    onClick={() => applyDateRange(getDateRange(d))}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isActive
                        ? 'bg-[#2b1055] text-white'
                        : 'bg-[#111214] text-[#cbd5e1] border border-[#2b2b35]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Total Companies" value={365} change="5.76%" isPositive />
                <StatCard title="Leads" value={420} change="5.76%" isPositive={false} />
                <StatCard title="Total Companies" value={365} change="5.76%" isPositive />
                <StatCard title="Leads" value={420} change="5.76%" isPositive={false} />
              </div>
            </div>

            <div className="flex items-stretch">
              <Card className="w-full bg-[#0f1720] border border-[#27272f]">
                <CardContent className="p-6">
                  <h3 className="text-sm text-[#c7c7d3] mb-4">Progress Overview</h3>

                  {/* Fixed square container so the donut renders centered and uncut */}
                  <div className="w-full flex justify-center">
                    <div className="w-56 h-36">
                      <InventoryDynamicChart
                        chartType="pie"
                        chartWidth="100%"
                        chartHeight="100%"
                        chartTitle="Progress Overview"
                        bgColor="dark"
                        showTitle={false}
                        showLegend={false}
                      />
                    </div>
                  </div>

                  {/* Single legend source of truth — no duplicate from ECharts */}
                  <div className="mt-5 space-y-2.5">
                    {LEGEND_ITEMS.map(item => (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 text-sm text-[#97a0b5]"
                      >
                        <span
                          className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-4">
            <Card className="bg-transparent border border-[#27272f]">
              <CardContent className="p-6">
                <h3 className="text-sm text-[#c7c7d3] mb-4">Number of Companies</h3>
                <div className="w-full h-72">
                  <InventoryDynamicChart
                    chartType="line"
                    chartHeight="100%"
                    chartTitle="Number of Companies"
                    bgColor="dark"
                    showTitle={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
