'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import UploadResumeIcon from '../../assets/UploadResumeIcon.svg';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

export interface PipelineData {
  month: string;
  jdCreated: number;
  resumeUploaded: number;
  interviewTaken: number;
}
export interface ConsumptionData {
  month: string;
  value: number;
}

const data: PipelineData[] = [
  { month: 'Jan', jdCreated: 30, resumeUploaded: 25, interviewTaken: 20 },
  { month: 'Feb', jdCreated: 35, resumeUploaded: 28, interviewTaken: 22 },
  { month: 'Mar', jdCreated: 40, resumeUploaded: 32, interviewTaken: 25 },
  { month: 'Apr', jdCreated: 38, resumeUploaded: 30, interviewTaken: 24 },
  { month: 'May', jdCreated: 42, resumeUploaded: 35, interviewTaken: 28 },
  { month: 'Jun', jdCreated: 45, resumeUploaded: 38, interviewTaken: 30 },
  { month: 'Jul', jdCreated: 43, resumeUploaded: 36, interviewTaken: 29 },
  { month: 'Aug', jdCreated: 48, resumeUploaded: 40, interviewTaken: 32 },
  { month: 'Sep', jdCreated: 50, resumeUploaded: 42, interviewTaken: 35 },
  { month: 'Oct', jdCreated: 52, resumeUploaded: 45, interviewTaken: 38 },
  { month: 'Nov', jdCreated: 55, resumeUploaded: 48, interviewTaken: 40 },
  { month: 'Dec', jdCreated: 58, resumeUploaded: 50, interviewTaken: 42 },
];

const dataForArea: ConsumptionData[] = [
  { month: 'Jan', value: 200 },
  { month: 'Feb', value: 400 },
  { month: 'Mar', value: 460 },
  { month: 'Apr', value: 150 },
  { month: 'May', value: 400 },
  { month: 'Jun', value: 560 },
  { month: 'Jul', value: 420 },
  { month: 'Aug', value: 580 },
  { month: 'Sep', value: 150 },
  { month: 'Oct', value: 400 },
  { month: 'Nov', value: 60 },
  { month: 'Dec', value: 610 },
];

type ChartType = 'bar' | 'pie' | 'areaChart' | 'line';

interface ChartProps {
  chartType: ChartType;
  chartWidth?: number | string;
  chartHeight?: number | string;
  chartTitle: string;
  bgColor?: string;
  showTitle?: boolean; // NEW: lets parent decide whether ECharts renders its own title
  showLegend?: boolean; // NEW: lets parent decide whether ECharts renders its own legend
}

const InventoryDynamicChart = ({
  chartType,
  chartWidth,
  chartHeight,
  chartTitle,
  bgColor,
  showTitle = false,
  showLegend = false,
}: ChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    let option: echarts.EChartsCoreOption = {};

    const isDark = bgColor === 'dark';

    switch (chartType) {
      case 'bar':
        option = {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          title: showTitle
            ? {
                text: chartTitle,
                right: 0,
                top: 0,
                textStyle: {
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: isDark ? '#fff' : '#333',
                  fontFamily: 'Poppins, sans-serif',
                },
              }
            : undefined,
          grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
          xAxis: {
            type: 'category',
            data: data.map(item => item.month),
            axisLine: { show: true, lineStyle: { color: '#ccc' } },
            axisTick: { show: false },
            axisLabel: { color: isDark ? '#fff' : '#333', fontFamily: 'Poppins, sans-serif' },
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: true, lineStyle: { color: '#eee' } },
            axisLabel: { color: isDark ? '#fff' : '#333', fontFamily: 'Poppins, sans-serif' },
          },
          series: [
            {
              name: 'Companies',
              type: 'bar',
              barWidth: 30,
              data: [250, 370, 420, 130, 360, 460, 380, 480, 120, 370, 0, 540],
              itemStyle: { color: 'rgba(99, 102, 241, 0.8)', borderRadius: [6, 6, 0, 0] },
              emphasis: { itemStyle: { color: 'rgba(99, 102, 241, 1)' } },
            },
          ],
        };
        break;

      case 'pie':
        // "Progress Overview" donut — Search Engine (purple) / Direct (green) / Email (orange)
        option = {
          tooltip: {
            trigger: 'item',
            formatter: (params: CallbackDataParams) => {
              const percent = (params.percent ?? 0).toFixed(2);
              return `
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${params.color};"></span>
                  <span style="color: ${isDark ? '#fff' : '#000'}; font-weight: 600; font-size: 13px;">
                    ${params.name}: ${params.value} (${percent}%)
                  </span>
                </div>
              `;
            },
            backgroundColor: isDark ? '#15151f' : '#fff',
            borderColor: isDark ? '#2a2a38' : '#ccc',
            borderWidth: 1,
            borderRadius: 12,
            padding: [8, 12],
            textStyle: { color: isDark ? '#fff' : '#000' },
          },
          title: showTitle
            ? {
                text: chartTitle,
                left: 0,
                top: 0,
                textStyle: {
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: isDark ? '#fff' : '#333',
                  fontFamily: 'Poppins, sans-serif',
                },
              }
            : undefined,
          legend: showLegend
            ? {
                orient: 'horizontal',
                left: 'center',
                bottom: '2%',
                itemWidth: 14,
                itemHeight: 14,
                itemGap: 24,
                icon: 'circle',
                textStyle: {
                  color: isDark ? '#e5e7eb' : '#333',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'Poppins, sans-serif',
                },
              }
            : undefined,
          series: [
            {
              name: 'Progress Overview',
              type: 'pie',
              center: ['50%', '50%'],
              radius: ['62%', '90%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderColor: isDark ? '#0f1720' : '#fff',
                borderWidth: 3,
              },
              emphasis: {
                scale: true,
                scaleSize: 6,
                itemStyle: {
                  shadowBlur: 16,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
              label: { show: false },
              labelLine: { show: false },
              data: [
                { value: 735, name: 'Search Engine', itemStyle: { color: '#6C3CE9' } },
                { value: 1048, name: 'Direct', itemStyle: { color: '#2FD69E' } },
                { value: 580, name: 'Email', itemStyle: { color: '#F5A623' } },
              ],
            },
          ],
        };
        break;

      case 'areaChart':
        option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'circle', label: { show: false } },
            backgroundColor: '#fff',
            borderColor: '#fff',
            borderWidth: 0,
            padding: [8, 12],
            textStyle: { color: '#333', fontSize: 12 },
            formatter: (params: CallbackDataParams[]) => {
              if (!params.length) return '';
              return `
                <div style="min-width: 150px; display: flex; align-items: center; gap: 6px;">
                  <span style="display: inline-block; width: 6px; height: 6px; background: #4050e7; border-radius: 50%;"></span>
                  <span>${params[0].name} 09- ${params[0].value} Credits</span>
                </div>
              `;
            },
            extraCssText: 'box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 4px;',
          },
          title: showTitle
            ? {
                text: chartTitle,
                left: 0,
                top: 0,
                padding: [0, 0, 40, 0],
                textStyle: {
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: isDark ? '#fff' : '#ccc',
                  fontFamily: 'Poppins, sans-serif',
                },
              }
            : undefined,
          grid: { left: '60px', right: '20px', bottom: '40px', top: '50px' },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dataForArea.map(item => item.month),
            axisLine: { show: true, lineStyle: { color: '#333' } },
            axisTick: { show: false },
            axisLabel: { color: '#666', fontSize: 12, padding: [8, 0] },
          },
          yAxis: {
            show: true,
            type: 'value',
            axisLine: { show: true, lineStyle: { color: '#333' } },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false },
            name: 'No. of Credits consumed',
            nameLocation: 'middle',
            nameTextStyle: { color: isDark ? '#fff' : '#ccc', fontSize: 12 },
          },
          series: [
            {
              name: 'credits',
              type: 'line',
              smooth: true,
              areaStyle: {
                opacity: 0.3,
                color: new echarts.graphic.LinearGradient(1, 0, 1, 1, [
                  { offset: 0, color: 'blue' },
                  { offset: 1, color: 'white' },
                ]),
              },
              itemStyle: { borderColor: 'blue', borderWidth: 2, color: 'blue' },
              lineStyle: { color: 'blue', width: 2, type: 'solid' },
              data: dataForArea.map(item => item.value),
            },
          ],
        };
        break;

      case 'line':
        // "Number of Companies" — purple smooth line with pink data dots, dark grid
        option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'line', lineStyle: { color: '#3d2a63', width: 1 } },
            backgroundColor: isDark ? '#15151f' : '#fff',
            borderColor: isDark ? '#2a2a38' : '#ccc',
            borderWidth: 1,
            borderRadius: 10,
            padding: [8, 12],
            textStyle: { color: isDark ? '#fff' : '#333', fontSize: 12 },
          },
          title: showTitle
            ? {
                text: chartTitle,
                left: 0,
                top: 0,
                textStyle: {
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: isDark ? '#fff' : '#333',
                  fontFamily: 'Poppins, sans-serif',
                },
              }
            : undefined,
          grid: {
            left: '3%',
            right: '3%',
            bottom: '8%',
            top: showTitle ? '18%' : '8%',
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dataForArea.map(item => item.month),
            axisLine: { lineStyle: { color: isDark ? '#26262f' : '#ccc' } },
            axisTick: { show: false },
            axisLabel: {
              color: isDark ? '#8b8b9a' : '#333',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 13,
            },
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 800,
            interval: 200,
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: true, lineStyle: { color: isDark ? '#1c1c26' : '#eee' } },
            axisLabel: {
              color: isDark ? '#8b8b9a' : '#333',
              fontFamily: 'Poppins, sans-serif',
              fontSize: 13,
            },
          },
          series: [
            {
              name: 'Companies',
              type: 'line',
              smooth: true,
              showSymbol: true,
              symbol: 'circle',
              symbolSize: 9,
              data: dataForArea.map(item => item.value),
              lineStyle: { color: '#6C3CE9', width: 3 },
              itemStyle: {
                color: '#EC1E9D',
                borderColor: isDark ? '#0a0a12' : '#fff',
                borderWidth: 2,
              },
              areaStyle: {
                opacity: 1,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(108,60,233,0.35)' },
                  { offset: 1, color: 'rgba(108,60,233,0.0)' },
                ]),
              },
            },
          ],
        };
        break;

      default:
        break;
    }

    chart.setOption(option, true); // true = don't merge stale title/legend from previous render

    const resizeHandler = () => chart.resize();
    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      chart.dispose();
    };
  }, [chartType, bgColor, chartTitle, showTitle, showLegend]);

  return (
    <div
      ref={chartRef}
      style={{
        width: typeof chartWidth === 'number' ? `${chartWidth}px` : chartWidth || '100%',
        height: typeof chartHeight === 'number' ? `${chartHeight}px` : chartHeight || '319px',
      }}
    />
  );
};

export default InventoryDynamicChart;
