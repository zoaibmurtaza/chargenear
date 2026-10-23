// Initial dummy reviews, verification requests, disputes, and earnings mock data

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    booking_id: "bk-102",
    charger_id: "dummy-ch-2",
    reviewer_id: "demo-driver-id",
    reviewer_name: "Hamza Tariq",
    reviewer_role: "driver",
    target_id: "host-2",
    target_name: "Zainab Rauf",
    rating: 5,
    comment: "Excellent high-speed charging in Gulberg! Very polite host, comfortable porch seating with tea.",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "rev-2",
    booking_id: "bk-102",
    charger_id: "dummy-ch-2",
    reviewer_id: "host-2",
    reviewer_name: "Zainab Rauf",
    reviewer_role: "host",
    target_id: "demo-driver-id",
    target_name: "Hamza Tariq",
    rating: 5,
    comment: "Hamza was punctual, parked properly, and completed the session promptly. Highly recommended driver!",
    created_at: new Date(Date.now() - 3600000 * 24 * 2 + 1800000).toISOString()
  }
];

export const INITIAL_VERIFICATIONS = [
  {
    id: "verif-1",
    host_id: "demo-host-id",
    host_name: "Ahmed Malik",
    host_email: "host.ahmed@chargenear.pk",
    charger_title: "DHA Phase 5 22kW Fast Charger",
    status: "approved", // 'pending', 'approved', 'rejected'
    setup_photo_url: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
    checklist: {
      hasEarthBreaker: true,
      hasFireExtinguisher: true,
      hasWeatherProtection: true,
      dedicatedWiring: true,
      clearEntrance: true
    },
    admin_notes: "Approved after reviewing safety checklist and clear Breaker / Earthing setup photo.",
    reviewed_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    id: "verif-2",
    host_id: "host-2",
    host_name: "Zainab Rauf",
    host_email: "zainab.rauf@gmail.com",
    charger_title: "Gulberg III Wallbox Charger",
    status: "pending",
    setup_photo_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    checklist: {
      hasEarthBreaker: true,
      hasFireExtinguisher: true,
      hasWeatherProtection: true,
      dedicatedWiring: true,
      clearEntrance: true
    },
    admin_notes: "",
    reviewed_at: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

export const INITIAL_DISPUTES = [
  {
    id: "disp-1",
    booking_id: "bk-102",
    reporter_id: "demo-driver-id",
    reporter_name: "Hamza Tariq",
    reporter_role: "driver",
    reason: "Meter kWh discrepancy",
    description: "The host entered 22.4 kWh on the display, but my onboard vehicle dashboard indicated 21.0 kWh received.",
    status: "resolved", // 'open', 'investigating', 'resolved'
    admin_resolution: "Host explained 1.4 kWh represents AC-DC conversion and cable thermal loss standard on 11kW Wallbox. Both parties satisfied.",
    created_at: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];
