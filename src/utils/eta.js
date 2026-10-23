import { haversineDistanceKm } from './haversine';

/**
 * Estimate Driving ETA based on distance in Pakistani urban traffic.
 * Average urban city speed assumed at ~25 km/h with signals and traffic.
 */
export function estimateDrivingEta(distanceKm) {
  if (distanceKm == null || isNaN(distanceKm)) {
    return { minutes: 0, text: 'Arrived / Unknown' };
  }

  if (distanceKm < 0.2) {
    return { minutes: 1, text: '< 1 min (Arrived / Outside)' };
  }

  // Speed ~25 km/h = ~2.4 mins per km
  const minutes = Math.max(1, Math.round((distanceKm / 25) * 60));
  
  if (minutes < 60) {
    return { minutes, text: `~${minutes} mins away` };
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return { minutes, text: `~${hours}h ${remainingMins}m away` };
}
