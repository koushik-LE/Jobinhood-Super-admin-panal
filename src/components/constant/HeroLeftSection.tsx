'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Coins, Users, MoreVertical } from 'lucide-react';

const stats = [
  {
    icon: Building2,
    label: 'Companies',
    value: '1,248',
    iconBg: 'bg-brand-dark/20',
    iconColor: 'text-brand',
  },
  {
    icon: Coins,
    label: 'Credits',
    value: '2.45M',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Users,
    label: 'Recruiters',
    value: '3,652',
    iconBg: 'bg-teal-500/20',
    iconColor: 'text-teal-400',
  },
];

const overviewStats = [
  { label: 'Total Companies', value: '1,248', change: '+12.5%' },
  { label: 'Active Companies', value: '936', change: '+8.3%' },
  { label: 'Total Credits', value: '2.45M', change: '+15.7%' },
];

// Chart data — plot points for the credits growth line
const chartPoints = [
  { day: 'May 21', value: 1.0 },
  { day: 'May 22', value: 1.4 },
  { day: 'May 23', value: 1.8 },
  { day: 'May 24', value: 2.0 },
  { day: 'May 25', value: 2.3 },
  { day: 'May 26', value: 2.6 },
  { day: 'May 27', value: 3.0 },
];

function CreditsChart() {
  const width = 440;
  const height = 140;
  const padding = 20;
  const maxVal = 3;

  const toX = (i: number) => padding + (i * (width - padding * 2)) / (chartPoints.length - 1);
  const toY = (v: number) => height - padding - (v / maxVal) * (height - padding * 2);

  const linePath = chartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.value)}`)
    .join(' ');

  const areaPath = `${linePath} L ${toX(chartPoints.length - 1)} ${height - padding} L ${toX(0)} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-dark)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brand-dark)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis labels */}
      {[0, 1, 2, 3].map(v => (
        <text key={v} x={0} y={toY(v) + 4} fill="#6b7280" fontSize="10">
          {v === 0 ? '0' : `${v}M`}
        </text>
      ))}

      <path d={areaPath} fill="url(#areaFill)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--brand-dark)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {chartPoints.map((p, i) => {
        const isLast = i === chartPoints.length - 1;
        return (
          <circle
            key={p.day}
            cx={toX(i)}
            cy={toY(p.value)}
            r={isLast ? 5 : 3.5}
            fill={isLast ? 'var(--brand)' : 'var(--brand-dark)'}
            stroke={isLast ? '#fff' : 'none'}
            strokeWidth={isLast ? 2 : 0}
          />
        );
      })}

      {chartPoints.map((p, i) => (
        <text key={p.day} x={toX(i)} y={height} fill="#6b7280" fontSize="9" textAnchor="middle">
          {p.day}
        </text>
      ))}
    </svg>
  );
}

const HeroLeftSection = () => (
  <div className="relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#0d0d14] to-[#1a0f2e] p-10 lg:p-14 flex flex-col justify-center">
    {/* Ambient glow */}
    <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-brand-dark/30 blur-[100px]" />
    <div className="pointer-events-none absolute -top-20 -right-10 h-56 w-56 rounded-full bg-brand-accent/10 blur-[100px]" />

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10"
    >
      <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
        Manage the <br />
        future of <span className="text-brand">hiring.</span>
      </h1>
      <p className="mt-4 text-gray-400 text-sm lg:text-base max-w-md">
        Monitor companies, manage credits, control recruiters and oversee platform operations from
        one intelligent dashboard.
      </p>
    </motion.div>

    {/* Content row: stat pills + overview card */}
    <div className="relative z-10 mt-10 flex gap-6">
      {/* Vertical stat pills */}
      <div className="flex flex-col gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * i }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 min-w-[150px]"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.iconBg}`}>
              <s.icon className={`h-4 w-4 ${s.iconColor}`} />
            </div>
            <div>
              <div className="text-[11px] text-gray-400">{s.label}</div>
              <div className="text-base font-semibold text-white">{s.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overview card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 rounded-2xl bg-[#0f0f18] border border-white/10 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-semibold text-sm">Overview</span>
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {overviewStats.map(s => (
            <div key={s.label}>
              <div className="text-[10px] text-gray-500 mb-1">{s.label}</div>
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">↑ {s.change}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-gray-500">Credits Growth</span>
          <span className="text-[11px] text-gray-400">This Month</span>
        </div>
        <CreditsChart />
      </motion.div>
    </div>
  </div>
);

export default HeroLeftSection;
