// Calculation utilities for bookings & session delivery
// Platform takes 15% commission, host earns 85%

export const PLATFORM_FEE_PERCENT = 0.15;
export const HOST_EARNINGS_PERCENT = 0.85;

export function calculateBilling(kwhDelivered, pricePerKwh) {
  const kwh = parseFloat(kwhDelivered) || 0;
  const rate = parseFloat(pricePerKwh) || 0;
  
  const totalAmountPkr = Math.round(kwh * rate);
  const platformFeePkr = Math.round(totalAmountPkr * PLATFORM_FEE_PERCENT);
  const hostEarningsPkr = totalAmountPkr - platformFeePkr; // exactly 85% remainder

  return {
    kwhDelivered: kwh,
    pricePerKwh: rate,
    totalAmountPkr,
    platformFeePkr,
    hostEarningsPkr,
  };
}

// Initial mock bookings for testing both Driver and Host views
export const INITIAL_BOOKINGS = [
  {
    id: "bk-101",
    charger_id: "dummy-ch-1",
    charger_title: "DHA Phase 5 22kW Fast Charger",
    charger_address: "Sector C, DHA Phase 5, Lahore",
    driver_id: "demo-driver-id",
    driver_name: "Hamza Tariq",
    driver_phone: "0300-1234567",
    host_id: "demo-host-id",
    host_name: "Ahmed Malik",
    connector_type: "Type 2",
    price_per_kwh_pkr: 75,
    start_time: new Date(Date.now() + 3600000 * 2).toISOString(),
    duration_hours: 2,
    estimated_kwh: 25,
    actual_kwh: null,
    total_amount_pkr: 1875,
    platform_fee_pkr: 281,
    host_earnings_pkr: 1594,
    status: "pending", // pending, accepted, declined, active, completed, cancelled
    payment_status: "unpaid", // unpaid, paid_mock
    payment_method: null,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "bk-102",
    charger_id: "dummy-ch-2",
    charger_title: "Gulberg III Wallbox Charger",
    charger_address: "Near MM Alam Road, Gulberg III, Lahore",
    driver_id: "demo-driver-id",
    driver_name: "Hamza Tariq",
    driver_phone: "0300-1234567",
    host_id: "host-2",
    host_name: "Zainab Rauf",
    connector_type: "CCS2",
    price_per_kwh_pkr: 85,
    start_time: new Date(Date.now() - 3600000 * 24).toISOString(),
    duration_hours: 1.5,
    estimated_kwh: 20,
    actual_kwh: 22.4,
    total_amount_pkr: 1904,
    platform_fee_pkr: 286,
    host_earnings_pkr: 1618,
    status: "completed",
    payment_status: "paid_mock",
    payment_method: "Mock JazzCash",
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  }
];
