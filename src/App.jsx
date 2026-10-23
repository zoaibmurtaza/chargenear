import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useBookings } from './BookingsContext';
import { useMarketplace } from './MarketplaceContext';
import { useChargers } from './ChargersContext';
import HostDashboard from './components/HostDashboard';
import DriverMapView from './components/DriverMapView';
import BookingsHistoryPage from './components/BookingsHistoryPage';
import HostEarningsDashboard from './components/HostEarningsDashboard';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import StaticLegalPages from './components/StaticLegalPages';
import AuthModal from './components/AuthModal';
import RealtimeNotificationsToast from './components/RealtimeNotificationsToast';
import { 
  Zap, Car, LogOut, Calendar, ShieldCheck, 
  BarChart3, Home, Map 
} from 'lucide-react';

export default function App() {
  const { user, logout } = useAuth();
  const { bookings } = useBookings();
  const { verifications, disputes } = useMarketplace();
  const { chargers } = useChargers();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // DEFAULT HOMEPAGE: "How It Works" landing page (instead of map)
  const [activeView, setActiveView] = useState('landing');

  const isAdmin = user?.role === 'admin' || user?.is_admin || user?.email === 'admin@evchargers.com';
  const isHost = user?.role === 'host';
  const isDriver = user?.role === 'driver';

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Host-only pending requests badge count
  const hostPendingCount = bookings.filter(
    (b) => b.status === 'pending' && (b.host_id === user?.id || b.host_id === 'demo-host-id')
  ).length;

  // Driver-only active/accepted bookings badge count
  const driverActiveCount = bookings.filter(
    (b) => (b.status === 'accepted' || b.status === 'active') && 
           (b.driver_id === user?.id || b.driver_id === 'demo-driver-id')
  ).length;

  // Admin pending reviews badge count
  const pendingChargersReviewCount = chargers.filter((c) => c.approval_status === 'pending_approval').length;
  const adminPendingCount = pendingChargersReviewCount +
                            verifications.filter((v) => v.status === 'pending').length +
                            disputes.filter((d) => d.status === 'open').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Realtime Pop-up Notifications */}
      <RealtimeNotificationsToast
        onSelectBooking={() => {
          setActiveView('bookings');
        }}
      />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo & Brand (Clicks directly back to Homepage: How It Works) */}
          <div 
            onClick={() => setActiveView('landing')} 
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
              isAdmin
                ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 shadow-purple-500/20'
                : isHost 
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/20' 
                : 'bg-gradient-to-tr from-brand-600 to-emerald-400 shadow-brand-500/20'
            }`}>
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : isHost ? <Zap className="w-5 h-5 fill-current" /> : <Zap className="w-5 h-5 fill-current" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Charge<span className="text-brand-600">Near</span>
                </span>
                
                {/* Role Badge */}
                {user ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : isHost 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}>
                    {isAdmin ? '🛡️ Admin' : isHost ? '⚡ Host' : '🚗 Driver'}
                  </span>
                ) : (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    Pakistan 🇵🇰
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Peer-to-Peer EV Charging Marketplace
              </p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* How It Works Homepage Link */}
            <button
              type="button"
              onClick={() => setActiveView('landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                activeView === 'landing'
                  ? 'bg-brand-50 border-brand-300 text-brand-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>How It Works</span>
            </button>

            {/* Map (For Drivers & Public) */}
            {(!user || isDriver) && (
              <button
                type="button"
                onClick={() => setActiveView('map')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition ${
                  activeView === 'map'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Map className="w-3.5 h-3.5 text-blue-400" />
                <span>Nearest Chargers Map</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* HOST-ONLY NAVIGATION */}
                {isHost && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveView('host_dashboard')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                        activeView === 'host_dashboard'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>My Sockets</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView('bookings')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition relative ${
                        activeView === 'bookings'
                          ? 'bg-brand-50 border-brand-300 text-brand-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sessions</span>
                      {hostPendingCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black animate-pulse">
                          {hostPendingCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView('earnings')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                        activeView === 'earnings'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden md:inline">Earnings</span>
                    </button>
                  </>
                )}

                {/* DRIVER-ONLY NAVIGATION */}
                {isDriver && (
                  <button
                    type="button"
                    onClick={() => setActiveView('bookings')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition relative ${
                      activeView === 'bookings'
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>My Bookings</span>
                    {driverActiveCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-black">
                        {driverActiveCount}
                      </span>
                    )}
                  </button>
                )}

                {/* ADMIN-ONLY NAVIGATION */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveView('admin')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition relative ${
                      activeView === 'admin'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'border-purple-300 bg-purple-50 text-purple-900 hover:bg-purple-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approvals & Finances</span>
                    {adminPendingCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-purple-600 text-white rounded-full text-[10px] font-black animate-pulse">
                        {adminPendingCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Profile Pill */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    isAdmin ? 'bg-purple-100 text-purple-800' : isHost ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="font-semibold max-w-[120px] truncate">{user.full_name}</span>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col">
        {activeView === 'landing' ? (
          /* DEFAULT HOMEPAGE: How It Works */
          <LandingPage
            onExploreMap={() => setActiveView('map')}
            onBecomeHost={() => openAuth('signup')}
            onOpenAuth={openAuth}
          />
        ) : activeView === 'terms' ? (
          <StaticLegalPages page="terms" onBack={() => setActiveView('landing')} />
        ) : activeView === 'privacy' ? (
          <StaticLegalPages page="privacy" onBack={() => setActiveView('landing')} />
        ) : activeView === 'admin' && isAdmin ? (
          /* MASTER ADMIN PORTAL */
          <AdminDashboard />
        ) : activeView === 'earnings' && isHost ? (
          /* HOST EARNINGS */
          <HostEarningsDashboard />
        ) : activeView === 'bookings' ? (
          /* BOOKINGS HISTORY */
          <BookingsHistoryPage />
        ) : activeView === 'host_dashboard' && isHost ? (
          /* HOST PORTAL */
          <HostDashboard onNavigateToEarnings={() => setActiveView('earnings')} />
        ) : (
          /* DRIVER PORTAL: Shows ONLY Nearest Chargers */
          <DriverMapView onNavigateToBookings={() => setActiveView('bookings')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ChargeNear</span>
            <span>• Peer-to-Peer EV Charging in Pakistan 🇵🇰</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <button
              type="button"
              onClick={() => setActiveView('landing')}
              className="hover:text-brand-600 transition"
            >
              How It Works
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveView('terms')}
              className="hover:text-brand-600 transition"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveView('privacy')}
              className="hover:text-brand-600 transition"
            >
              Privacy Policy
            </button>
          </div>

          <div className="text-slate-400">
            <span>15% Commission • 85% Host Earnings</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}
