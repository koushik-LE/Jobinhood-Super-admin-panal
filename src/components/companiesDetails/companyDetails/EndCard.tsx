'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconBriefcase,
  IconFileDescription,
  IconClipboardCheck,
  IconUserCheck,
} from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { showToast } from '@/components/constant/custom-toast';

interface CompanyStats {
  numberOfJd?: number;
  resumeUpdated?: number;
  shortListedApplicant?: number;
  interviewTaken?: number;
}

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  iconBackground: string;
}

const StatsCard1 = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CompanyStats>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);

        const response = await axios.post(`/api/company/details/${id}/endcardDetails`, { id });

        if (response.data?.data) {
          setStats(response.data.data);
          setError(null);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: unknown) {
        const error = err as AxiosError<{ error: string }>;

        console.error('Error fetching company details:', error);

        const errorMessage = error.response?.data?.error || 'Failed to load company statistics';

        setError(errorMessage);
        showToast('error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompanyDetails();
    }
  }, [id]);

  const statsConfig: Stat[] = [
    {
      label: 'Cumulative JDs',
      value: stats.numberOfJd ?? 0,
      icon: <IconBriefcase size={19} strokeWidth={1.6} />,
      iconColor: 'text-[#7C3AED]',
      iconBackground: 'bg-[#35156B]',
    },
    {
      label: 'Cumulative Resumes',
      value: stats.resumeUpdated ?? 0,
      icon: <IconFileDescription size={19} strokeWidth={1.6} />,
      iconColor: 'text-[#14B8A6]',
      iconBackground: 'bg-[#073D3B]',
    },
    {
      label: 'Cumulative Shortlist',
      value: stats.shortListedApplicant ?? 0,
      icon: <IconClipboardCheck size={19} strokeWidth={1.6} />,
      iconColor: 'text-[#F59E0B]',
      iconBackground: 'bg-[#4A3215]',
    },
    {
      label: 'Cumulative Interviews',
      value: stats.interviewTaken ?? 0,
      icon: <IconUserCheck size={19} strokeWidth={1.6} />,
      iconColor: 'text-[#D946EF]',
      iconBackground: 'bg-[#42164A]',
    },
  ];

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-[#38384A] bg-[#191827] p-4">
        <div className="rounded-lg bg-red-900/20 p-4 text-center text-sm text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        h-full/2
        rounded-xl
        border
        border-[#38384A]
        bg-[#191827]
        px-5
        sm:px-6
        py-5
      "
    >
      <div className="flex flex-col">
        {statsConfig.map((stat, index) => (
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
                min-h-[63px]
                items-center
                justify-between
                gap-4
              "
            >
              {/* Left side */}
              <div className="flex min-w-0 items-center gap-3">
                {/* Icon */}
                <div
                  className={`
                    flex
                    h-[30px]
                    w-[30px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    ${stat.iconBackground}
                    ${stat.iconColor}
                  `}
                >
                  {stat.icon}
                </div>

                {/* Label */}
                {loading ? (
                  <Skeleton className="h-5 w-36 bg-white/10" />
                ) : (
                  <span
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-white
                      sm:text-[15px]
                    "
                  >
                    {stat.label}
                  </span>
                )}
              </div>

              {/* Right value */}
              {loading ? (
                <Skeleton className="h-5 w-10 shrink-0 bg-white/10" />
              ) : (
                <span
                  className="
                    shrink-0
                    text-sm
                    font-semibold
                    text-white
                    sm:text-[15px]
                  "
                >
                  {stat.value.toLocaleString()}
                </span>
              )}
            </motion.div>

            {/* Divider */}
            {index < statsConfig.length - 1 && <div className="h-px w-full bg-[#353547]" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StatsCard1;
