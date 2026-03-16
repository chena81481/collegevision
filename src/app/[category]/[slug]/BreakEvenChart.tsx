"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator } from 'lucide-react';
import { formatINR } from './utils';

interface BreakEvenChartProps {
  totalFee: number;
  avgCtc: number;
}

export default function BreakEvenChart({ totalFee, avgCtc }: BreakEvenChartProps) {
  // Simple projection: 3 years
  const data = [
    { name: 'Year 0', investment: -totalFee, return: 0 },
    { name: 'Year 1', investment: -totalFee, return: avgCtc },
    { name: 'Year 2', investment: -totalFee, return: avgCtc * 2 },
    { name: 'Year 3', investment: -totalFee, return: avgCtc * 3 },
  ];

  const breakEvenYear = totalFee / avgCtc;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" /> ROI & Break-Even Analysis
          </h2>
          <p className="text-sm text-slate-500 mt-1">Projected return on investment over 3 years.</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. Break-Even</div>
          <div className="text-lg font-black text-blue-600">{breakEvenYear.toFixed(1)} Years</div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => [formatINR(Number(value || 0)), 'Cumulative Return']}
            />
            <Area type="monotone" dataKey="return" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorReturn)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
