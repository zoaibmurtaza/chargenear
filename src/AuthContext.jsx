import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isConfigured } from './supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chargenear_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('chargenear_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chargenear_user');
    }
  }, [user]);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // Explicit Admin credentials check
      if (cleanEmail === 'admin@evchargers.com' && cleanPass === 'adminevchargers') {
        const adminUser = {
          id: 'admin-super-id',
          email: 'admin@evchargers.com',
          full_name: 'Master Admin',
          role: 'admin',
          is_admin: true,
        };
        setUser(adminUser);
        return;
      }

      if (isConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPass });
        if (error) throw error;
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        setUser({
          id: data.user.id,
          email: data.user.email,
          full_name: profile?.full_name || cleanEmail.split('@')[0],
          role: profile?.role || (cleanEmail.includes('host') ? 'host' : 'driver'),
          phone: profile?.phone || '',
          nic: profile?.nic || '',
          vehicle_number: profile?.vehicle_number || '',
          vehicle_name: profile?.vehicle_name || '',
          is_admin: profile?.is_admin || cleanEmail === 'admin@evchargers.com',
        });
      } else {
        // Local auth lookup
        const savedProfiles = JSON.parse(localStorage.getItem('chargenear_all_profiles') || '{}');
        const existing = savedProfiles[cleanEmail];

        if (existing) {
          if (existing.password && existing.password !== cleanPass) {
            throw new Error('Invalid email or password.');
          }
          setUser(existing);
        } else {
          // If first-time login without prior signup, determine role
          const isHost = cleanEmail.includes('host');
          const userData = {
            id: (isHost ? 'host-' : 'driver-') + Math.random().toString(36).substring(2, 7),
            email: cleanEmail,
            full_name: isHost ? 'EV Host' : 'EV Driver',
            role: isHost ? 'host' : 'driver',
            phone: '0300-1234567',
            nic: isHost ? '' : '42201-1234567-1',
            vehicle_number: isHost ? '' : 'EV-2026',
            vehicle_name: isHost ? '' : 'Electric Vehicle',
            is_admin: false,
          };
          setUser(userData);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Signup
  const signup = async (signupData) => {
    setLoading(true);
    try {
      const {
        email,
        password,
        fullName,
        role,
        phone = '',
        nic = '',
        vehicleNumber = '',
        vehicleName = '',
      } = signupData;

      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      const newId = (role === 'host' ? 'host-' : 'driver-') + Date.now();
      const userData = {
        id: newId,
        email: cleanEmail,
        password: cleanPass,
        full_name: fullName,
        role,
        phone,
        nic,
        vehicle_number: vehicleNumber,
        vehicle_name: vehicleName,
        is_admin: cleanEmail === 'admin@evchargers.com',
      };

      if (isConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              full_name: fullName,
              role,
              phone,
              nic,
              vehicle_number: vehicleNumber,
              vehicle_name: vehicleName,
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          userData.id = data.user.id;
          await supabase.from('profiles').insert([userData]);
        }
      } else {
        const savedProfiles = JSON.parse(localStorage.getItem('chargenear_all_profiles') || '{}');
        savedProfiles[cleanEmail] = userData;
        localStorage.setItem('chargenear_all_profiles', JSON.stringify(savedProfiles));
      }

      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
