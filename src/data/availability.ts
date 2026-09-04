import { TimeSlot, Staff, TimePreference } from '@/types';
import { MOCK_STAFF } from './staff';

export function generateSlotsForDate(
  outletId: string,
  dateString: string,
  preferredStaffId?: string
): TimeSlot[] {
  // Slots from 09:30 AM to 08:30 PM at 30 min intervals
  const baseTimes = [
    { time: '09:30', displayTime: '09:30 AM' },
    { time: '10:00', displayTime: '10:00 AM' },
    { time: '10:30', displayTime: '10:30 AM' },
    { time: '11:00', displayTime: '11:00 AM' },
    { time: '11:30', displayTime: '11:30 AM' },
    { time: '12:00', displayTime: '12:00 PM' },
    { time: '12:30', displayTime: '12:30 PM' },
    { time: '13:00', displayTime: '01:00 PM' },
    { time: '14:00', displayTime: '02:00 PM' },
    { time: '14:30', displayTime: '02:30 PM' },
    { time: '15:00', displayTime: '03:00 PM' },
    { time: '15:30', displayTime: '03:30 PM' },
    { time: '16:00', displayTime: '04:00 PM' },
    { time: '16:30', displayTime: '04:30 PM' },
    { time: '17:00', displayTime: '05:00 PM' },
    { time: '17:30', displayTime: '05:30 PM' },
    { time: '18:00', displayTime: '06:00 PM' },
    { time: '18:30', displayTime: '06:30 PM' },
    { time: '19:00', displayTime: '07:00 PM' },
    { time: '19:30', displayTime: '07:30 PM' },
    { time: '20:00', displayTime: '08:00 PM' },
  ];

  const outletStaff = MOCK_STAFF.filter((s) => s.outletId === outletId);
  const fallbackStaff = outletStaff[0] || {
    id: 'stf_default',
    name: 'Senior Stylist',
    role: 'Senior Stylist',
  };

  // Seed deterministic pseudo-random availability based on date & outlet
  const seedString = `${outletId}_${dateString}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  return baseTimes.map((item, index) => {
    const isBooked = Math.abs((hash + index * 17) % 7) === 0; // ~15% booked
    const staff = preferredStaffId
      ? outletStaff.find((s) => s.id === preferredStaffId) || fallbackStaff
      : outletStaff[index % (outletStaff.length || 1)] || fallbackStaff;

    return {
      time: item.time,
      displayTime: item.displayTime,
      available: !isBooked,
      staffId: staff.id,
      staffName: staff.name,
    };
  });
}

export function matchSlotToPreference(
  slots: TimeSlot[],
  pref: TimePreference | null
): TimeSlot | undefined {
  if (!pref || slots.length === 0) return undefined;

  if (pref.type === 'EXACT' && pref.time) {
    return slots.find((s) => s.time === pref.time && s.available);
  }
  if (pref.type === 'AFTER' && pref.time) {
    return slots.find((s) => s.time >= pref.time! && s.available);
  }
  if (pref.type === 'BEFORE' && pref.time) {
    return [...slots].reverse().find((s) => s.time <= pref.time! && s.available);
  }
  if (pref.type === 'MORNING') {
    return slots.find((s) => s.time < '12:00' && s.available);
  }
  if (pref.type === 'AFTERNOON') {
    return slots.find((s) => s.time >= '12:00' && s.time < '16:00' && s.available);
  }
  if (pref.type === 'EVENING') {
    return slots.find((s) => s.time >= '16:00' && s.available);
  }
  if (pref.type === 'ANY') {
    return slots.find((s) => s.available);
  }
  return undefined;
}
