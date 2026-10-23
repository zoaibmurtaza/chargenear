import React, { useState } from 'react';
import { useBookings } from '../BookingsContext';
import { useAuth } from '../AuthContext';
import { 
  DollarSign, Zap, TrendingUp, Calendar, ArrowUpRight, 
  BarChart3, CheckCircle2, ShieldCheck, Wallet 
} from 'lucide-react';

export default function HostEarningsDashboard() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'month', 'week'

  // Filter host bookings
  const hostBookings = bookings.filter(
    (b) => b.host_id === user?.id || b.host_id === 'demo-host-id'
  );

  const completedSessions = hostBookings.filter((b) => b.status === 'completed');
  
  // Calculate Totals
  const totalHostEarnings = completedSessions.reduce(
    (acc, b) => acc + (b.host_earnings_pkr || 0), 0
  );
  const totalKwhDelivered = completedSessions.reduce(
    (acc, b) => acc + (parseFloat(b.actual_kwh) || parseFloat(b.estimated_kwh) || 0), 0
  );
  const platformFeesDeducted = completedSessions.reduce(
    (acc, b) => acc + (b.platform_fee_pkr || 0), 0
  );

  // Simple pure SVG/HTML Monthly Bar Chart Data
  const monthlyData = [
    { month: 'Jun', earnings: 4200, kwh: 56 },
    { month: 'Jul', earnings: 7800, kwh: 104 },
    { month: 'Aug', earnings: 11400, kwh: 152 },
    { month: 'Sep', earnings: 9200, kwh: 122 },
    { month: 'Oct', earnings: Math.max(12600, totalHostEarnings), kwh: Math.max(168, Math.round(totalKwhDelivered)) },
  ];

  const maxEarnings = Math.max(...monthlyData.map((d) => d.earnings), 15000);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Host Earnings Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              85% Net Payout
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time financial breakdown in Pakistani Rupees (PKR) and power distribution metrics.
          </p>
        </div>

        {/* Payout Channel Card */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Payout Destination</span>
            <span className="text-xs font-bold text-slate-800">JazzCash (0300-XXXXXXX)</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Host Payout</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            PKR {totalHostEarnings.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">85% net of all sessions</span>
          <div className="absolute right-3 top-3 w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivered Energy</span>
          <div className="text-2xl font-black text-brand-700 mt-1">
            {totalKwhDelivered.toFixed(1)} <span className="text-sm font-normal text-slate-500">kWh</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Across {completedSessions.length} completed slots</span>
          <div className="absolute right-3 top-3 w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Commission</span>
          <div className="text-2xl font-black text-slate-700 mt-1">
            PKR {platformFeesDeducted.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">15% maintenance & matching fee</span>
          <div className="absolute right-3 top-3 w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg. Session Value</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            PKR {completedSessions.length > 0 ? Math.round(totalHostEarnings / completedSessions.length) : 0}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Per EV charging session</span>
          <div className="absolute right-3 top-3 w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

      </div>

      {/* Monthly Earnings Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              Monthly Revenue Performance (PKR)
            </h3>
            <p className="text-xs text-slate-500">Historical host earnings and units dispensed in Pakistan</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              Host Net (PKR)
            </span>
          </div>
        </div>

        {/* Bar chart visualisation */}
        <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-100">
          {monthlyData.map((item) => {
            const heightPercent = Math.round((item.earnings / maxEarnings) * 100);
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Tooltip on hover */}
                <div className="text-center opacity-0 group-hover:opacity-100 transition duration-200 text-[11px] bg-slate-900 text-white py-1 px-2 rounded-lg font-bold shadow-md pointer-events-none whitespace-nowrap">
                  PKR {item.earnings.toLocaleString()} ({item.kwh} kWh)
                </div>

                {/* Animated bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl group-hover:brightness-110 transition-all duration-300 relative shadow-sm"
                />

                {/* Month label */}
                <span className="text-xs font-bold text-slate-600 mt-2">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Completed Session Payouts</h3>
          <p className="text-xs text-slate-500">Detailed itemization per charging slot</p>
        </div>

        {completedSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed sessions recorded yet. Completed sessions will itemize here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Booking Ref</th>
                  <th className="py-3 px-5">Driver</th>
                  <th className="py-3 px-5">Delivered</th>
                  <th className="py-3 px-5">Total Billed</th>
                  <th className="py-3 px-5">Host Net (85%)</th>
                  <th className="py-3 px-5">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {completedSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-5 font-mono text-slate-700">#{s.id}</td>
                    <td className="py-3 px-5 font-semibold text-slate-800">{s.driver_name}</td>
                    <td className="py-3 px-5 text-brand-700 font-bold">{s.actual_kwh || s.estimated_kwh} kWh</td>
                    <td className="py-3 px-5">PKR {s.total_amount_pkr}</td>
                    <td className="py-3 px-5 font-black text-emerald-700">PKR {s.host_earnings_pkr}</td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
