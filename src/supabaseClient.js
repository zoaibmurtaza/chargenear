import { createClient } from '@supabase/supabase-js';
import { KARACHI_SEED_CHARGERS } from './utils/karachiSeed';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-chargenear.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('mock')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initial chargers containing original Lahore/Islamabad chargers + 10 Karachi seed chargers
export const INITIAL_DUMMY_CHARGERS = [
  ...KARACHI_SEED_CHARGERS,
  {
    id: "dummy-ch-1",
    host_id: "demo-host-id",
    host_name: "Ahmed Malik",
    title: "DHA Phase 5 22kW Fast Charger",
    address: "Sector C, DHA Phase 5, Lahore",
    city: "Lahore",
    latitude: 31.4697,
    longitude: 74.3980,
    connector_type: "Type 2",
    power_kw: 22.0,
    price_per_kwh_pkr: 75,
    photos: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80"],
    available_hours: "24/7",
    notes: "Located inside secure gated porch. Gate keeper opens 24/7. Tea and shaded waiting chair available.",
    status: "active",
    availability: "available",
    _rating: 5.0,
    _reviewCount: 38,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: "dummy-ch-2",
    host_id: "host-2",
    host_name: "Zainab Rauf",
    title: "Gulberg III Wallbox Charger",
    address: "Near MM Alam Road, Gulberg III, Lahore",
    city: "Lahore",
    latitude: 31.5126,
    longitude: 74.3533,
    connector_type: "CCS2",
    power_kw: 11.0,
    price_per_kwh_pkr: 85,
    photos: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"],
    available_hours: "08:00 AM - 11:00 PM",
    notes: "High power home charger. Wi-Fi password available upon arrival.",
    status: "active",
    availability: "available",
    _rating: 4.8,
    _reviewCount: 24,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "dummy-ch-3",
    host_id: "host-3",
    host_name: "Usman Ghani",
    title: "F-7/2 Islamabad GB/T EV Station",
    address: "Street 18, F-7/2, Islamabad",
    city: "Islamabad",
    latitude: 33.7215,
    longitude: 73.0558,
    connector_type: "GB/T",
    power_kw: 7.4,
    price_per_kwh_pkr: 70,
    photos: ["https://images.unsplash.com/photo-1558441719-8b449c6ff67c?auto=format&fit=crop&w=800&q=80"],
    available_hours: "07:00 AM - 10:00 PM",
    notes: "Ideal for BYD, Deepal, Changan and imported Chinese EV models.",
    status: "paused",
    availability: "offline",
    _rating: 4.7,
    _reviewCount: 16,
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  }
];
