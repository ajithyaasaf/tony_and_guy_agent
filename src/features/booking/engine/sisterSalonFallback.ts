import { Outlet, TimeSlot, TimePreference, SisterSalonSuggestion } from '@/types';
import { MOCK_OUTLETS } from '@/data/outlets';
import { generateSlotsForDate, matchSlotToPreference } from '@/data/availability';
import { formatDisplayTime } from '@/lib/utils';

/**
 * Calculates great-circle distance between two geographic coordinates using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats a metric distance into human-friendly luxury retail copy (e.g., "400m away" or "1.2 km away")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.max(100, Math.round((distanceKm * 1000) / 50) * 50);
    return `${meters}m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

export interface NearbySisterSalon {
  outlet: Outlet;
  distanceKm: number;
  distanceFormatted: string;
}

/**
 * Finds all active sister salons ordered by geographic proximity to the specified outlet
 */
export function findNearbySisterSalons(
  currentOutletId: string,
  maxDistanceKm = 15,
  limit = 5
): NearbySisterSalon[] {
  const current = MOCK_OUTLETS.find((o) => o.id === currentOutletId);
  if (!current) return [];

  const candidates: NearbySisterSalon[] = [];

  for (const out of MOCK_OUTLETS) {
    if (out.id === current.id || out.status !== 'active') continue;

    // Same city priority
    if (out.city.toLowerCase() !== current.city.toLowerCase()) continue;

    const dist = calculateHaversineDistanceKm(
      current.latitude,
      current.longitude,
      out.latitude,
      out.longitude
    );

    if (dist <= maxDistanceKm) {
      candidates.push({
        outlet: out,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist),
      });
    }
  }

  candidates.sort((a, b) => a.distanceKm - b.distanceKm);
  return candidates.slice(0, limit);
}

/**
 * Analyzes availability across nearby sister salons when a requested slot or time is occupied
 */
export function findSisterSalonSlotFallback(params: {
  outletId: string;
  date: string;
  requestedTime?: string; // e.g. "18:00"
  timePreference?: TimePreference | null;
  preferredStaffId?: string;
}): SisterSalonSuggestion | null {
  const { outletId, date, requestedTime, timePreference } = params;
  const currentOutlet = MOCK_OUTLETS.find((o) => o.id === outletId);
  if (!currentOutlet) return null;

  const nearbySalons = findNearbySisterSalons(outletId, 12, 4);
  if (nearbySalons.length === 0) return null;

  // Search each sister salon in order of proximity
  for (const nearby of nearbySalons) {
    const sisterSlots = generateSlotsForDate(nearby.outlet.id, date, params.preferredStaffId);
    let matchedSlot: TimeSlot | undefined = undefined;

    if (requestedTime) {
      // 1. Exact match at sister salon
      matchedSlot = sisterSlots.find((s) => s.time === requestedTime && s.available);

      // 2. Adjacent +/- 30m / 60m match
      if (!matchedSlot) {
        const [reqH, reqM] = requestedTime.split(':').map(Number);
        const reqMinutes = reqH * 60 + reqM;

        const availableSlotsWithDiff = sisterSlots
          .filter((s) => s.available)
          .map((s) => {
            const [h, m] = s.time.split(':').map(Number);
            return { slot: s, diff: Math.abs(h * 60 + m - reqMinutes) };
          })
          .sort((a, b) => a.diff - b.diff);

        if (availableSlotsWithDiff.length > 0 && availableSlotsWithDiff[0].diff <= 90) {
          matchedSlot = availableSlotsWithDiff[0].slot;
        }
      }
    } else if (timePreference) {
      matchedSlot = matchSlotToPreference(sisterSlots, timePreference);
    } else {
      matchedSlot = sisterSlots.find((s) => s.available);
    }

    if (matchedSlot) {
      const requestedDisplay = requestedTime ? formatDisplayTime(requestedTime) : 'your requested time';
      const headline = `${currentOutlet.name} is fully booked at ${requestedDisplay}, but our nearby salon ${nearby.outlet.name} (${nearby.distanceFormatted}) has an open slot at ${matchedSlot.displayTime}!`;

      return {
        originalOutlet: currentOutlet,
        sisterOutlet: nearby.outlet,
        distanceKm: nearby.distanceKm,
        distanceFormatted: nearby.distanceFormatted,
        date,
        suggestedSlot: matchedSlot,
        requestedTime,
        headline,
      };
    }
  }

  return null;
}
