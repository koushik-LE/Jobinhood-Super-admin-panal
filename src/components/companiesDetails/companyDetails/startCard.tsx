'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IconCoins, IconCoin, IconUsers } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';
import { showToast } from '@/components/constant/custom-toast';

interface StatsData {
  creditDistribute: number;
  availableCredit: number;
  companyId: number;
}

interface Stat {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconClass: string;
  iconBg: string;
}

interface StatsCardProps {
  id: string;
  userCount: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ id, userCount }) => {
  const [loading, setLoading] = useState<boolean>(true);

  const [statsData, setStatsData] = useState<StatsData>({
    creditDistribute: 0,
    availableCredit: 0,
    companyId: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await axios.post(
          `/api/company/details/${id}/creditBalace`,
          { id },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data: StatsData = response.data?.data;

        setStatsData(data);
      } catch {
        showToast('error', 'Fetching data failed');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const stats: Stat[] = [
    {
      label: 'Cumulative Credits',
      value: statsData.creditDistribute,
      icon: <IconCoins size={19} strokeWidth={1.6} />,
      iconClass: 'text-[#14B8A6]',
      iconBg: 'bg-[#073D3B]',
    },
    {
      label: 'Available Credits',
      value: statsData.availableCredit,
      icon: <IconCoin size={19} strokeWidth={1.6} />,
      iconClass: 'text-[#F59E0B]',
      iconBg: 'bg-[#4A3215]',
    },
    {
      label: 'Number of Users',
      value: userCount,
      icon: <IconUsers size={19} strokeWidth={1.6} />,
      iconClass: 'text-[#D946EF]',
      iconBg: 'bg-[#42164A]',
    },
  ];

  return (
    <div
      className="
        w-full
        h-full
        rounded-xl
        border
        border-[#38384A]
        bg-[#191827]
        px-5
        sm:px-6
      "
    >
      <div className="flex flex-col">
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
              }}
              className="
                flex
                items-center
                justify-between
                min-h-[57px]
                gap-4
              "
            >
              {/* Left side */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Icon */}
                <div
                  className={`
                    flex
                    items-center
                    justify-center
                    w-[30px]
                    h-[30px]
                    rounded-md
                    shrink-0
                    ${stat.iconBg}
                    ${stat.iconClass}
                  `}
                >
                  {stat.icon}
                </div>

                {/* Label */}
                {loading ? (
                  <Skeleton className="h-5 w-32 bg-white/10" />
                ) : (
                  <span
                    className="
                      text-sm
                      sm:text-[15px]
                      font-semibold
                      text-white
                      truncate
                    "
                  >
                    {stat.label}
                  </span>
                )}
              </div>

              {/* Value */}
              {loading ? (
                <Skeleton className="h-5 w-16 bg-white/10 shrink-0" />
              ) : (
                <span
                  className="
                    text-sm
                    sm:text-[15px]
                    font-semibold
                    text-white
                    shrink-0
                  "
                >
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </span>
              )}
            </motion.div>

            {/* Divider */}
            {index < stats.length - 1 && <div className="h-px w-full bg-[#353547]" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;
