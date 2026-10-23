import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Wallet, CreditCard, Building2, AlertCircle } from 'lucide-react';

export default function MockPaymentModal({ booking, isOpen, onClose, onPaid }) {
  if (!isOpen || !booking) return null;

  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [mockAccount, setMockAccount] = useState('03001234567');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onPaid(booking.id, `Mock ${paymentMethod}`);
        onClose();
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[1060] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <h3 className="font-bold text-base">Mock Payment Step</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Payment Successful!</h4>
            <p className="text-xs text-slate-500">
              Mock transaction complete. Booking marked as <strong>Paid</strong> in PKR.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-4">
            
            {/* Amount Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Payable</span>
              <div className="text-3xl font-black text-brand-700 mt-0.5">
                PKR {booking.total_amount_pkr}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Delivered: {booking.actual_kwh || booking.estimated_kwh} kWh @ PKR {booking.price_per_kwh_pkr}/kWh
              </p>
            </div>

            {/* Method Choice */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Select Mock Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'JazzCash', icon: Wallet, label: 'JazzCash' },
                  { id: 'EasyPaisa', icon: CreditCard, label: 'Easypaisa' },
                  { id: 'Raast', icon: Building2, label: 'Raast / Bank' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                        paymentMethod === item.id
                          ? 'border-brand-600 bg-brand-50/60 text-brand-900 ring-2 ring-brand-500/20'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mock Account Input */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Mock Mobile Wallet / Account No
              </label>
              <input
                type="text"
                required
                value={mockAccount}
                onChange={(e) => setMockAccount(e.target.value)}
                placeholder="0300XXXXXXX (Dummy)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-mono"
              />
            </div>

            {/* Privacy Alert */}
            <div className="flex items-start gap-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Sandbox / Simulation Only:</strong> No real bank, credit card, or CNIC credentials will ever be asked or stored.
              </span>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{processing ? 'Simulating Payment...' : `Pay PKR ${booking.total_amount_pkr}`}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
