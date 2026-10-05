import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

type RevenueChartProps = {
  barColor: string;
  chartWidth: number; // This is the bar width, e.g. 190px
  data: number[]; // Dynamic data for the bars
};

const RevenueChart: React.FC<RevenueChartProps> = ({ barColor, chartWidth, data }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = echarts.init(chartRef.current);

      // Randomly adjust the data while keeping the order
      const adjustedData = data.map(value => {
        // Random multiplier between 0.5 and 1.5 to change the height randomly
        const randomMultiplier = Math.random() * (1.5 - 0.5) + 0.5;
        return value * randomMultiplier;
      });

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '-14%',
          right: '3%',
          bottom: '10%',
          top: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            show: false,
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisTick: {
              alignWithLabel: true,
            },
            axisLine: { show: false },
            splitLine: { show: false },
          },
        ],
        yAxis: [
          {
            show: false,
            type: 'value',
            axisLine: { show: false },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: 'Direct',
            type: 'bar',
            barWidth: chartWidth,
            itemStyle: {
              color: barColor, // Setting the bar color dynamically
            },
            data: adjustedData, // Using adjusted data
            barGap: '5%', // Reduce the gap between bars (default is 30%)
            barCategoryGap: '2%', // Reduce the gap between categories
          },
        ],
      };

      chartInstance.setOption(option);

      // Resize chart on window resize
      window.addEventListener('resize', () => chartInstance.resize());

      return () => {
        chartInstance.dispose();
      };
    }
  }, [barColor, chartWidth, data]);

  return <div ref={chartRef} style={{ height: '62px', width: '130px' }} />;
};

export default RevenueChart;
