import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Zap, Mail, Lock, User, ArrowRight, Car, Phone, Shield, Hash } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  if (!isOpen) return null;

  const { login, signup, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [role, setRole] = useState('driver'); // 'driver' or 'host'

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Driver-specific fields
  const [nic, setNic] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleName, setVehicleName] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (role === 'driver') {
          if (!nic.trim()) throw new Error('Driver CNIC / NIC is required.');
          if (!vehicleNumber.trim()) throw new Error('Vehicle registration number is required.');
          if (!vehicleName.trim()) throw new Error('Vehicle model / name is required (e.g. BYD Atto 3).');
        }

        await signup({
          email,
          password,
          fullName,
          role,
          phone,
          nic,
          vehicleNumber,
          vehicleName,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in fade-in duration-200">
        
        {/* Banner */}
        <div className={`p-6 text-white text-center relative ${
          role === 'host' ? 'bg-gradient-to-br from-emerald-600 to-teal-800' : 'bg-gradient-to-br from-brand-600 to-blue-800'
        }`}>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3">
            {role === 'host' ? <Zap className="w-6 h-6 fill-current text-yellow-300" /> : <Car className="w-6 h-6 text-white" />}
          </div>
          <h2 className="text-xl font-black">
            {isLogin ? 'Log In to ChargeNear' : role === 'driver' ? 'Register as EV Driver' : 'Register as Charger Host'}
          </h2>
          <p className="text-xs text-brand-100 mt-1">
            {isLogin ? 'Enter your registered email and password' : 'Peer-to-peer EV charging ecosystem in Pakistan'}
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Role Choice for Signup */}
          {!isLogin && (
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                Choose Registration Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('driver')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                    role === 'driver'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">EV Driver</span>
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Find, book & pay for charging points
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                    role === 'host'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">Charger Host</span>
                    <Zap className="w-4 h-4 text-emerald-600 fill-current" />
                  </div>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Rent my charger & earn in PKR
                  </span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto px-0.5">
            
            {/* Full Name & Phone for Signup */}
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Hamza Tariq"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DRIVER SPECIFIC FIELDS: NIC, Vehicle Number, Vehicle Name */}
            {!isLogin && role === 'driver' && (
              <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                  EV Driver & Vehicle Verification Details
                </span>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    CNIC / National Identity Card (NIC) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-blue-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                      placeholder="e.g. 42201-1234567-1"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Vehicle Plate / Reg No <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-blue-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="e.g. KHI-24-9876"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      EV Make & Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      placeholder="e.g. BYD Atto 3 / MG 4"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.pk"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 mt-4 ${
                role === 'host' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : `Register as ${role === 'host' ? 'Host' : 'Driver'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Clean switch between Sign In and Register - zero demo clutter */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-brand-600 hover:text-brand-700 font-bold"
            >
              {isLogin ? "Don't have an account? Register here" : 'Already registered? Log in here'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
