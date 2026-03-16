"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface ChartPoint {
  month: string;
  'Net Balance': number;
}

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    const val = payload[0].value as number;
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3">
        <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
        <p className={`text-sm font-bold ${val >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
          {val >= 0 ? '+' : ''}{formatINR(val)}
        </p>
      </div>
    );
  }
  return null;
}

interface ROIChartProps {
  chartData: ChartPoint[];
  breakEvenMonth: number;
}

export default function ROIChart({ chartData, breakEvenMonth }: ROIChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="month" axisLine={false} tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10}
        />
        <YAxis
          tickFormatter={(v) => `₹${Math.abs(v / 1000)}k`}
          axisLine={false} tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }} dx={-10}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={0} stroke="#10b981" strokeDasharray="4 4"
          label={{ position: 'insideTopRight', value: '✓ Break Even', fill: '#10b981', fontSize: 11, fontWeight: 700 }}
        />
        <defs>
          <linearGradient id="roiGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset={`${Math.min((breakEvenMonth / 18) * 100, 100)}%`} stopColor="#10b981" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <Line
          type="monotone" dataKey="Net Balance"
          stroke="url(#roiGradient)" strokeWidth={3}
          dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#0f766e' }}
          activeDot={{ r: 6, fill: '#0f766e', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
