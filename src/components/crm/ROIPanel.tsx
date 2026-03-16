"use client";

import { useState } from "react";
import { 
  Calculator, TrendingUp, DollarSign, 
  ChevronRight, ArrowRight, Wallet,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
mport { calculateROI, formatFeeINR } from "@/lib/roi-calculator";

export function ROIPanel({ application }: { application: any }) {
  const [scholarship, setScholarship] = useState(application.scholarshipAmount || 0);
  const [salary, setSalary] = useState(application.university?.avgStartingSalary || 1200000); // 12L default

  const roi = calculateROI(
    application.tuitionFee || 2000000, 
    application.livingCost || 1000000,
    scholarship,
    salary
  );

  return (
    <Card className="rounded-3xl border-slate-200 bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/20 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-blue-600/20 transition-all duration-1000" />
      
      <CardHeader className="p-8 border-b border-white/5 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-white tracking-tighter">Financial ROI Engine</CardTitle>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Break-even Analysis for {application.university?.name}</p>
          </div>
          <Calculator className="h-6 w-6 text-emerald-400" />
        </div>
      </CardHeader>

      <CardContent className="p-8 relative z-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Analysis Stats */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payback Period</div>
               <div className="flex items-end gap-2">
                  <div className="text-4xl font-black text-emerald-400">{roi.paybackYears}</div>
                  <div className="text-sm font-bold text-slate-500 mb-1.5 uppercase">Years</div>
               </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">5-Year Net Return</div>
               <div className="flex items-end gap-2 text-blue-400">
                  <div className="text-3xl font-black">₹{(roi.totalReturnsFiveYears / 100000).toFixed(1)}L</div>
               </div>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholarship Amount</label>
                 <span className="text-sm font-black text-white">{formatFeeINR(scholarship)}</span>
              </div>
              <input type="range" 
                value={[scholarship]} 
                max={2000000} 
                step={50000} 
                onValueChange={(vals) => setScholarship(vals[0])}
                className="[&_.relative]:bg-emerald-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Graduate Salary</label>
                 <span className="text-sm font-black text-white">{formatFeeINR(salary)}/yr</span>
              </div>
              <input type="range" 
                value={[salary]} 
                max={5000000} 
                step={100000} 
                onValueChange={(vals) => setSalary(vals[0])}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3 text-[10px] font-bold text-slate-500 italic bg-white/5 p-4 rounded-xl border border-white/5">
           <Info className="h-4 w-4 text-blue-400" />
           Payback calculation assumes 60% of take-home pay is allocated to tuition repayment. Actuals may vary based on local tax laws and living standards.
        </div>
      </CardContent>
    </Card>
  );
}
