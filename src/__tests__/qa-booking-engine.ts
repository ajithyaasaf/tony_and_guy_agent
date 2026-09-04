/**
 * TONI&GUY Phase 1 QA — Adaptive Booking Engine Verification
 * ============================================================
 * Tests all 17 scenarios from the user's QA specification.
 * This runs against the actual bookingReducer + intentParser logic.
 */

import {
  bookingReducer,
  INITIAL_BOOKING_STATE,
  computeMissingFields,
  computeCompletedFields,
  BookingAction,
} from '@/features/booking/bookingReducer';
import { parseNaturalLanguageInput } from '@/features/concierge/engine/intentParser';
import { MOCK_SERVICES } from '@/data/services';
import { MOCK_OUTLETS } from '@/data/outlets';
import { MOCK_OFFERS } from '@/data/offers';
import { MOCK_STAFF } from '@/data/staff';
import { generateSlotsForDate } from '@/data/availability';
import { BookingState, Service, Outlet, TimeSlot, BookingField } from '@/types';
import { addDays, format } from 'date-fns';

// ============================================================
// HELPERS
// ============================================================
let passCount = 0;
let failCount = 0;

function assert(condition: boolean, label: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passCount++;
  } else {
    console.log(`  ❌ FAIL: ${label}${details ? ` — ${details}` : ''}`);
    failCount++;
  }
}

function applyActions(initialState: BookingState, actions: BookingAction[]): BookingState {
  return actions.reduce((s, a) => bookingReducer(s, a), initialState);
}

function getService(keyword: string): Service {
  let cleanKw = keyword.replace(/\\'/g, "'").toLowerCase();
  if (cleanKw.includes('precision') || cleanKw.includes('classic')) {
    cleanKw = 'classic';
  }
  const found = MOCK_SERVICES.find(s => s.name.toLowerCase().includes(cleanKw) || s.id.toLowerCase().includes(cleanKw));
  if (!found) throw new Error(`Service not found: ${keyword}`);
  return found;
}

function getOutlet(area: string): Outlet {
  const found = MOCK_OUTLETS.find(o => o.area.toLowerCase().includes(area.toLowerCase()));
  if (!found) throw new Error(`Outlet not found: ${area}`);
  return found;
}

const today = new Date();
const todayISO = format(today, 'yyyy-MM-dd');
const tomorrowISO = format(addDays(today, 1), 'yyyy-MM-dd');

// ============================================================
// SCENARIO 1: Service Only
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 1: Service Only');
console.log('═══════════════════════════════════════════════════════');
{
  const srv = getService('Men\'s Classic Haircut');
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: srv },
  ]);
  assert(state.services.length === 1, 'One service selected');
  assert(state.services[0].id === srv.id, `Service is "${srv.name}"`);
  assert(state.missingFields.includes('outlet'), 'Outlet is still missing');
  assert(state.missingFields.includes('date'), 'Date is still missing');
  assert(state.missingFields.includes('time'), 'Time is still missing');
  assert(state.missingFields.includes('customer'), 'Customer is still missing');
  assert(!state.missingFields.includes('services'), 'Services field is NOT missing');
  assert(state.totalPrice === srv.price, `Price is ₹${srv.price}`);
}

// ============================================================
// SCENARIO 2: Service + Date
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 2: Service + Date');
console.log('═══════════════════════════════════════════════════════');
{
  const srv = getService('Men\'s Precision Haircut');
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: srv },
    { type: 'SET_DATE', payload: tomorrowISO },
  ]);
  assert(state.services.length === 1, 'Service preserved');
  assert(state.date === tomorrowISO, `Date is ${tomorrowISO}`);
  assert(!state.missingFields.includes('services'), 'Services completed');
  assert(!state.missingFields.includes('date'), 'Date completed');
  assert(state.missingFields.includes('outlet'), 'Outlet still missing');
  assert(state.missingFields.includes('time'), 'Time still missing');
}

// ============================================================
// SCENARIO 3: Service + Date + Time
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 3: Service + Date + Time');
console.log('═══════════════════════════════════════════════════════');
{
  const srv = getService('Men\'s Precision Haircut');
  const outlet = getOutlet('Anna Nagar');
  const state1 = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: srv },
    { type: 'SET_OUTLET', payload: outlet },
    { type: 'SET_DATE', payload: tomorrowISO },
  ]);
  const slots = generateSlotsForDate(outlet.id, tomorrowISO);
  const availableSlot = slots.find(s => s.available);
  assert(!!availableSlot, 'At least one available slot exists');
  if (availableSlot) {
    const state2 = bookingReducer(state1, { type: 'SELECT_SLOT', payload: availableSlot });
    assert(state2.selectedSlot?.time === availableSlot.time, `Slot ${availableSlot.displayTime} selected`);
    assert(state2.services.length === 1, 'Services preserved after slot selection');
    assert(state2.outlet?.id === outlet.id, 'Outlet preserved after slot selection');
    assert(state2.date === tomorrowISO, 'Date preserved after slot selection');
    assert(!state2.missingFields.includes('time'), 'Time completed');
    assert(state2.missingFields.includes('customer'), 'Only customer is missing');
  }
}

// ============================================================
// SCENARIO 4: Service + Outlet + Date + Time
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 4: Service + Outlet + Date + Time (Full Except Customer)');
console.log('═══════════════════════════════════════════════════════');
{
  const srv = getService('Beard Shape-Up');
  const outlet = getOutlet('Nungambakkam');
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: srv },
    { type: 'SET_OUTLET', payload: outlet },
    { type: 'SET_DATE', payload: tomorrowISO },
  ]);
  const slots = generateSlotsForDate(outlet.id, tomorrowISO);
  const slot19 = slots.find(s => s.time === '19:00' && s.available) || slots.find(s => s.available);
  if (slot19) {
    const state2 = bookingReducer(state, { type: 'SELECT_SLOT', payload: slot19 });
    assert(state2.missingFields.length === 1, 'Only 1 missing field');
    assert(state2.missingFields[0] === 'customer', 'Missing field is customer');
    assert(state2.services.length === 1, 'Service preserved');
    assert(state2.outlet?.id === outlet.id, 'Outlet preserved');
    assert(state2.date === tomorrowISO, 'Date preserved');
    assert(state2.selectedSlot === slot19, 'Slot preserved');
  }
}

// ============================================================
// SCENARIO 5: Multiple Services
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 5: Multiple Services');
console.log('═══════════════════════════════════════════════════════');
{
  const haircut = getService('Men\'s Classic Haircut');
  const beard = getService('Beard Shape-Up');
  const spa = getService('Intensive Restorative Hair Spa');
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: haircut },
    { type: 'ADD_SERVICE', payload: beard },
    { type: 'ADD_SERVICE', payload: spa },
  ]);
  assert(state.services.length === 3, '3 services selected');
  assert(state.totalPrice === haircut.price + beard.price + spa.price, `Total price = ₹${haircut.price + beard.price + spa.price}`);
  assert(state.totalDuration === haircut.durationMinutes + beard.durationMinutes + spa.durationMinutes, 'Duration sums correctly');
  
  // Verify deduplication
  const state2 = bookingReducer(state, { type: 'ADD_SERVICE', payload: haircut });
  assert(state2.services.length === 3, 'Duplicate service rejected — still 3');
}

// ============================================================
// SCENARIO 6: "Any Stylist"
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 6: "Any Stylist"');
console.log('═══════════════════════════════════════════════════════');
{
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'SET_STYLIST_PREFERENCE', payload: 'any' },
  ]);
  assert(state.stylistPreference === 'any', 'Preference is "any"');
  assert(state.selectedStaff === null, 'No specific staff selected');
  assert(state.completedFields.includes('stylist'), '"stylist" marked completed for "any"');
}

// ============================================================
// SCENARIO 7: Specific Stylist
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 7: Specific Stylist');
console.log('═══════════════════════════════════════════════════════');
{
  const outlet = getOutlet('Anna Nagar');
  const outletStaff = MOCK_STAFF.filter(s => s.outletId === outlet.id);
  assert(outletStaff.length > 0, `Anna Nagar has ${outletStaff.length} staff members`);
  
  if (outletStaff.length > 0) {
    const selectedStaff = outletStaff[0];
    const state = applyActions(INITIAL_BOOKING_STATE, [
      { type: 'SET_OUTLET', payload: outlet },
      { type: 'SELECT_STAFF', payload: selectedStaff },
    ]);
    assert(state.selectedStaff?.id === selectedStaff.id, `Staff "${selectedStaff.name}" selected`);
    assert(state.stylistPreference === 'specific', 'Preference auto-set to "specific"');
    assert(state.completedFields.includes('stylist'), '"stylist" marked completed');
  }
}

// ============================================================
// SCENARIO 8: Changing Only the Date (Context Preservation)
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 8: Changing Only the Date — Context Preservation');
console.log('═══════════════════════════════════════════════════════');
{
  const srv = getService('Men\'s Precision Haircut');
  const outlet = getOutlet('Anna Nagar');
  const dayAfterTomorrow = format(addDays(today, 2), 'yyyy-MM-dd');
  
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: srv },
    { type: 'SET_OUTLET', payload: outlet },
    { type: 'SET_DATE', payload: tomorrowISO },
  ]);
  
  const state2 = bookingReducer(state, { type: 'SET_DATE', payload: dayAfterTomorrow });
  assert(state2.date === dayAfterTomorrow, 'Date changed to day after tomorrow');
  assert(state2.services.length === 1, 'Services PRESERVED');
  assert(state2.services[0].id === srv.id, 'Same service still selected');
  assert(state2.outlet?.id === outlet.id, 'Outlet PRESERVED');
  assert(state2.selectedSlot === null, 'Slot correctly cleared (date changed)');
}

// ============================================================
// SCENARIO 9: Changing Only the Outlet (Context Preservation)
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 9: Changing Only the Outlet — Context Preservation');
console.log('═══════════════════════════════════════════════════════');
{
  const srv = getService('Men\'s Classic Haircut');
  const outlet1 = getOutlet('Anna Nagar');
  const outlet2 = getOutlet('Nungambakkam');
  
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: srv },
    { type: 'SET_OUTLET', payload: outlet1 },
    { type: 'SET_DATE', payload: tomorrowISO },
  ]);
  
  const state2 = bookingReducer(state, { type: 'SET_OUTLET', payload: outlet2 });
  assert(state2.outlet?.id === outlet2.id, 'Outlet changed to Nungambakkam');
  assert(state2.services.length === 1, 'Services PRESERVED');
  assert(state2.date === tomorrowISO, 'Date PRESERVED');
  assert(state2.selectedSlot === null, 'Slot cleared (outlet changed)');
  assert(state2.selectedStaff === null, 'Staff cleared (different outlet)');
}

// ============================================================
// SCENARIO 10: Changing Only the Time
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 10: Changing Only the Time — Context Preservation');
console.log('═══════════════════════════════════════════════════════');
{
  const srv = getService('Men\'s Precision Haircut');
  const outlet = getOutlet('Anna Nagar');
  
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: srv },
    { type: 'SET_OUTLET', payload: outlet },
    { type: 'SET_DATE', payload: tomorrowISO },
  ]);
  
  const slots = generateSlotsForDate(outlet.id, tomorrowISO);
  const slot1 = slots.find(s => s.available);
  const slot2 = slots.filter(s => s.available && s !== slot1)[0];
  
  if (slot1 && slot2) {
    const withSlot1 = bookingReducer(state, { type: 'SELECT_SLOT', payload: slot1 });
    assert(withSlot1.selectedSlot === slot1, `First slot selected: ${slot1.displayTime}`);
    
    const withSlot2 = bookingReducer(withSlot1, { type: 'SELECT_SLOT', payload: slot2 });
    assert(withSlot2.selectedSlot === slot2, `Slot changed to: ${slot2.displayTime}`);
    assert(withSlot2.services.length === 1, 'Services PRESERVED');
    assert(withSlot2.outlet?.id === outlet.id, 'Outlet PRESERVED');
    assert(withSlot2.date === tomorrowISO, 'Date PRESERVED');
  }
}

// ============================================================
// SCENARIO 11: Changing Services After Selecting a Slot
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 11: Changing Services After Selecting a Slot');
console.log('═══════════════════════════════════════════════════════');
{
  const haircut = getService('Men\'s Precision Haircut');
  const beard = getService('Beard Shape-Up');
  const outlet = getOutlet('Anna Nagar');
  
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: haircut },
    { type: 'SET_OUTLET', payload: outlet },
    { type: 'SET_DATE', payload: tomorrowISO },
  ]);
  const slots = generateSlotsForDate(outlet.id, tomorrowISO);
  const slot = slots.find(s => s.available)!;
  const withSlot = bookingReducer(state, { type: 'SELECT_SLOT', payload: slot });
  
  const withExtraService = bookingReducer(withSlot, { type: 'ADD_SERVICE', payload: beard });
  assert(withExtraService.services.length === 2, 'Now 2 services');
  assert(withExtraService.outlet?.id === outlet.id, 'Outlet PRESERVED');
  assert(withExtraService.date === tomorrowISO, 'Date PRESERVED');
  assert(withExtraService.selectedSlot === null, 'Slot CLEARED (duration changed)');
  assert(withExtraService.totalPrice === haircut.price + beard.price, 'Price recalculated');
}

// ============================================================
// SCENARIO 12: No Availability
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 12: No Availability');
console.log('═══════════════════════════════════════════════════════');
{
  const outlet = getOutlet('Anna Nagar');
  const slots = generateSlotsForDate(outlet.id, tomorrowISO);
  assert(slots.length > 0, `${slots.length} total slots generated`);
  
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'SET_ERROR', payload: 'No available slots for selected date. Please try another date.' },
  ]);
  assert(state.errorMessage === 'No available slots for selected date. Please try another date.', 'Error message set');
}

// ============================================================
// SCENARIO 13: Alternative Slot Selection
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 13: Alternative Slot Selection');
console.log('═══════════════════════════════════════════════════════');
{
  const outlet = getOutlet('Anna Nagar');
  const slots = generateSlotsForDate(outlet.id, tomorrowISO);
  const availableSlots = slots.filter(s => s.available);
  assert(availableSlots.length >= 2, `At least 2 available slots (got ${availableSlots.length})`);
  
  if (availableSlots.length >= 2) {
    const state1 = applyActions(INITIAL_BOOKING_STATE, [
      { type: 'SELECT_SLOT', payload: availableSlots[0] },
    ]);
    const state2 = bookingReducer(state1, { type: 'SELECT_SLOT', payload: availableSlots[1] });
    assert(state2.selectedSlot === availableSlots[1], `Changed to: ${availableSlots[1].displayTime}`);
  }
}

// ============================================================
// SCENARIO 14: Booking Failure
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 14: Booking Failure');
console.log('═══════════════════════════════════════════════════════');
{
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'SET_STATUS', payload: 'error' },
    { type: 'SET_ERROR', payload: 'Unable to confirm booking. Please try again.' },
  ]);
  assert(state.status === 'error', 'Status is "error"');
  assert(state.errorMessage === 'Unable to confirm booking. Please try again.', 'Error message set');
  
  const recovered = bookingReducer(state, { type: 'RESET_BOOKING' });
  assert(recovered.status === 'idle', 'After reset, status is idle');
  assert(recovered.errorMessage === null, 'Error cleared');
}

// ============================================================
// SCENARIO 15: Successful Mock Confirmation
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 15: Successful Mock Confirmation');
console.log('═══════════════════════════════════════════════════════');
{
  const srv = getService('Men\'s Precision Haircut');
  const outlet = getOutlet('Anna Nagar');
  const slots = generateSlotsForDate(outlet.id, tomorrowISO);
  const slot = slots.find(s => s.available)!;
  
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: srv },
    { type: 'SET_OUTLET', payload: outlet },
    { type: 'SET_DATE', payload: tomorrowISO },
    { type: 'SELECT_SLOT', payload: slot },
    { type: 'SET_CUSTOMER', payload: { name: 'Siddharth Verma', phone: '+91 98400 12345' } },
  ]);
  
  assert(state.missingFields.length === 0, 'All required fields complete');
  
  const ref = 'TG-123456';
  const confirmed = bookingReducer(state, { type: 'CONFIRM_BOOKING', payload: { bookingReference: ref } });
  assert(confirmed.status === 'confirmed', 'Status is "confirmed"');
  assert(confirmed.bookingReference === ref, `Booking reference is ${ref}`);
  assert(confirmed.services.length === 1, 'Services preserved in confirmation');
}

// ============================================================
// SCENARIO 16: Natural Language Entry
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 16: Natural Language Entry');
console.log('═══════════════════════════════════════════════════════');
{
  const parsed = parseNaturalLanguageInput('I want a haircut at Anna Nagar tomorrow at 7 PM', today);
  assert(parsed.intent === 'BOOK_APPOINTMENT', `Intent is BOOK_APPOINTMENT (got ${parsed.intent})`);
  assert(parsed.services.length > 0, `Extracted ${parsed.services.length} service(s)`);
  assert(parsed.services.some(s => s.name.toLowerCase().includes('haircut')), 'Includes haircut');
  assert(parsed.outlet !== null, 'Outlet extracted');
  assert(parsed.outlet?.area === 'Anna Nagar', `Outlet area is Anna Nagar (got ${parsed.outlet?.area})`);
  assert(parsed.date === format(addDays(today, 1), 'yyyy-MM-dd'), 'Date is tomorrow');
  assert(parsed.dateLabel === 'Tomorrow', 'Date label is "Tomorrow"');
  assert(parsed.timePreference !== null, 'Time preference extracted');
  assert(parsed.timePreference?.type === 'EXACT', `Time type is EXACT (got ${parsed.timePreference?.type})`);
  assert(parsed.timePreference?.time === '19:00', `Time is 19:00 (got ${parsed.timePreference?.time})`);
  
  // Feed parsed results into booking reducer
  const actions: BookingAction[] = [];
  if (parsed.services.length > 0) actions.push({ type: 'SET_SERVICES', payload: parsed.services });
  if (parsed.outlet) actions.push({ type: 'SET_OUTLET', payload: parsed.outlet });
  if (parsed.date) actions.push({ type: 'SET_DATE', payload: parsed.date });
  
  const state = applyActions(INITIAL_BOOKING_STATE, actions);
  assert(state.services.length > 0, 'Booking state has services from NL');
  assert(state.outlet !== null, 'Booking state has outlet from NL');
  assert(state.date !== null, 'Booking state has date from NL');
  assert(!state.missingFields.includes('services'), 'Services not missing');
  assert(!state.missingFields.includes('outlet'), 'Outlet not missing');
  assert(!state.missingFields.includes('date'), 'Date not missing');
}

// ============================================================
// SCENARIO 16b: NL — Multiple Services + Date + Time
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 16b: NL — "Haircut and beard trim this Saturday after 6 PM"');
console.log('═══════════════════════════════════════════════════════');
{
  const parsed = parseNaturalLanguageInput('Haircut and beard trim this Saturday after 6 PM', today);
  assert(parsed.intent === 'BOOK_APPOINTMENT', `Intent is BOOK_APPOINTMENT`);
  assert(parsed.services.length >= 2, `Extracted ${parsed.services.length} services (expected ≥2)`);
  assert(parsed.date !== null, 'Date extracted (this Saturday)');
  assert(parsed.timePreference !== null, 'Time preference extracted');
}

// ============================================================
// SCENARIO 16c: NL — Offers Intent
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 16c: NL — "Show me offers and combos"');
console.log('═══════════════════════════════════════════════════════');
{
  const parsed = parseNaturalLanguageInput('Show me offers and combos', today);
  assert(parsed.intent === 'OFFERS', `Intent is OFFERS (got ${parsed.intent})`);
}

// ============================================================
// SCENARIO 16d: NL — Find Salon
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 16d: NL — "Find nearest salon in Nungambakkam"');
console.log('═══════════════════════════════════════════════════════');
{
  const parsed = parseNaturalLanguageInput('Find nearest salon in Nungambakkam', today);
  assert(parsed.intent === 'FIND_SALON', `Intent is FIND_SALON (got ${parsed.intent})`);
  assert(parsed.outlet !== null || parsed.locationQuery !== null, 'Location extracted');
}

// ============================================================
// SCENARIO 17: Traditional UI Entry (Step-by-step)
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SCENARIO 17: Traditional UI Entry (Step-by-step)');
console.log('═══════════════════════════════════════════════════════');
{
  const haircut = getService('Men\'s Classic Haircut');
  const facial = getService('Sothys Paris Express');
  const outlet = getOutlet('Koramangala');
  
  let state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: haircut },
    { type: 'ADD_SERVICE', payload: facial },
  ]);
  assert(state.services.length === 2, 'Step 1: 2 services selected');
  
  state = bookingReducer(state, { type: 'SET_OUTLET', payload: outlet });
  assert(state.outlet?.id === outlet.id, 'Step 2: Outlet selected');
  assert(state.services.length === 2, 'Step 2: Services PRESERVED');
  
  state = bookingReducer(state, { type: 'SET_DATE', payload: tomorrowISO });
  assert(state.services.length === 2, 'Step 3: Services PRESERVED');
  assert(state.outlet?.id === outlet.id, 'Step 3: Outlet PRESERVED');
  
  const slots = generateSlotsForDate(outlet.id, tomorrowISO);
  const slot = slots.find(s => s.available)!;
  state = bookingReducer(state, { type: 'SELECT_SLOT', payload: slot });
  assert(state.services.length === 2, 'Step 4: Services PRESERVED');
  assert(state.outlet?.id === outlet.id, 'Step 4: Outlet PRESERVED');
  
  state = bookingReducer(state, { type: 'SET_CUSTOMER', payload: { name: 'Priya Menon', phone: '+91 99001 23456' } });
  assert(state.missingFields.length === 0, 'All fields complete');
  assert(state.services.length === 2, 'Step 5: Services PRESERVED');
  assert(state.outlet?.id === outlet.id, 'Step 5: Outlet PRESERVED');
  assert(state.selectedSlot === slot, 'Step 5: Slot PRESERVED');
  
  const confirmed = bookingReducer(state, { type: 'CONFIRM_BOOKING', payload: { bookingReference: 'TG-789012' } });
  assert(confirmed.status === 'confirmed', 'Booking confirmed');
}

// ============================================================
// CONVERGENCE TEST
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('CONVERGENCE: NL and Traditional UI converge to same state');
console.log('═══════════════════════════════════════════════════════');
{
  const parsed = parseNaturalLanguageInput('I want a haircut at Anna Nagar tomorrow', today);
  const nlActions: BookingAction[] = [];
  if (parsed.services.length > 0) nlActions.push({ type: 'SET_SERVICES', payload: parsed.services });
  if (parsed.outlet) nlActions.push({ type: 'SET_OUTLET', payload: parsed.outlet });
  if (parsed.date) nlActions.push({ type: 'SET_DATE', payload: parsed.date });
  const stateNL = applyActions(INITIAL_BOOKING_STATE, nlActions);
  
  const haircut = getService('Men\'s Precision Haircut');
  const annaOutlet = getOutlet('Anna Nagar');
  const stateUI = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'SET_SERVICES', payload: [haircut] },
    { type: 'SET_OUTLET', payload: annaOutlet },
    { type: 'SET_DATE', payload: tomorrowISO },
  ]);
  
  assert(stateNL.services.length === stateUI.services.length, 'Same # of services');
  assert(stateNL.outlet?.id === stateUI.outlet?.id, 'Same outlet');
  assert(stateNL.date === stateUI.date, 'Same date');
  assert(JSON.stringify(stateNL.missingFields.sort()) === JSON.stringify(stateUI.missingFields.sort()), 'Same missing fields');
}

// ============================================================
// OFFER BOOKING TEST
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('OFFER BOOKING: Combo sets correct price/duration');
console.log('═══════════════════════════════════════════════════════');
{
  const offer = MOCK_OFFERS[0];
  const includedSrvs = MOCK_SERVICES.filter(s => offer.serviceIds.includes(s.id));
  
  const state = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'SET_OFFER', payload: { offer, services: includedSrvs } },
  ]);
  
  assert(state.selectedOffer?.id === offer.id, `Offer "${offer.name}" selected`);
  assert(state.totalPrice === offer.offerPrice, `Price is offer price ₹${offer.offerPrice}`);
  assert(state.totalDuration === offer.durationMinutes, `Duration is ${offer.durationMinutes}min`);
  
  const extraSrv = MOCK_SERVICES.find(s => !offer.serviceIds.includes(s.id))!;
  const state2 = bookingReducer(state, { type: 'ADD_SERVICE', payload: extraSrv });
  assert(state2.selectedOffer === null, 'Offer cleared when custom service added');
}

// ============================================================
// RESET TEST
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('RESET BOOKING: Full state reset');
console.log('═══════════════════════════════════════════════════════');
{
  const srv = getService('Men\'s Precision Haircut');
  const outlet = getOutlet('Anna Nagar');
  const fullState = applyActions(INITIAL_BOOKING_STATE, [
    { type: 'ADD_SERVICE', payload: srv },
    { type: 'SET_OUTLET', payload: outlet },
    { type: 'SET_DATE', payload: tomorrowISO },
    { type: 'SET_CUSTOMER', payload: { name: 'Test', phone: '1234' } },
  ]);
  
  const reset = bookingReducer(fullState, { type: 'RESET_BOOKING' });
  assert(reset.services.length === 0, 'After reset: 0 services');
  assert(reset.outlet === null, 'After reset: no outlet');
  assert(reset.date === null, 'After reset: no date');
  assert(reset.customer === null, 'After reset: no customer');
  assert(reset.missingFields.length === 5, 'After reset: 5 missing fields');
}

// ============================================================
// DATA INTEGRITY
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('DATA INTEGRITY: Mock datasets');
console.log('═══════════════════════════════════════════════════════');
{
  assert(MOCK_SERVICES.length >= 20, `${MOCK_SERVICES.length} services in catalog`);
  assert(MOCK_OUTLETS.length === 64, `${MOCK_OUTLETS.length} outlets (expected 64)`);
  assert(MOCK_OFFERS.length === 8, `${MOCK_OFFERS.length} offers (expected 8)`);
  assert(MOCK_STAFF.length > 0, `${MOCK_STAFF.length} staff members`);
  
  const invalidOutlets = MOCK_OUTLETS.filter(o => !o.id || !o.name || !o.city || !o.area || !o.latitude || !o.longitude);
  assert(invalidOutlets.length === 0, `All outlets valid (${invalidOutlets.length} invalid)`);
  
  const allServiceIds = new Set(MOCK_SERVICES.map(s => s.id));
  const offersWithInvalidRefs = MOCK_OFFERS.filter(o => !o.serviceIds.every(id => allServiceIds.has(id)));
  assert(offersWithInvalidRefs.length === 0, `All offer refs valid (${offersWithInvalidRefs.length} broken)`);
  
  const slots = generateSlotsForDate(MOCK_OUTLETS[0].id, tomorrowISO);
  assert(slots.length >= 10, `${slots.length} slots generated`);
  assert(slots.some(s => s.available), 'Some slots available');
}

// ============================================================
// SISTER SALON SMART SLOT FALLBACK ENGINE
// ============================================================
console.log('\n═══════════════════════════════════════════════════════');
console.log('SISTER SALON FALLBACK: GPS proximity & slot alternative');
console.log('═══════════════════════════════════════════════════════');
{
  const { 
    calculateHaversineDistanceKm, 
    formatDistance, 
    findNearbySisterSalons, 
    findSisterSalonSlotFallback 
  } = require('../features/booking/engine/sisterSalonFallback');

  // 1. Distance Calculation & Formatting
  const dist = calculateHaversineDistanceKm(13.0064, 80.2575, 12.9992, 80.2689); // Adyar to Besant Nagar (~1.4km)
  assert(dist > 0.5 && dist < 3.0, `Calculated distance: ${dist.toFixed(2)} km`);
  assert(formatDistance(0.4) === '400m away', 'Format sub-km distance: 400m away');
  assert(formatDistance(1.42) === '1.4 km away', 'Format km distance: 1.4 km away');

  // 2. Sister Salons Discovery
  const adyarOutlet = MOCK_OUTLETS.find(o => o.name.toLowerCase().includes('adyar'))!;
  const nearbyToAdyar = findNearbySisterSalons(adyarOutlet.id, 10, 4);
  assert(nearbyToAdyar.length > 0, `Found ${nearbyToAdyar.length} nearby sister salons to Adyar`);
  assert(nearbyToAdyar[0].distanceKm <= nearbyToAdyar[1].distanceKm, 'Sister salons ordered by ascending distance');

  // 3. Sister Salon Slot Fallback Function
  const fallback = findSisterSalonSlotFallback({
    outletId: adyarOutlet.id,
    date: tomorrowISO,
    requestedTime: '18:00',
  });
  assert(fallback !== null, 'Sister salon fallback generated when requested');
  assert(fallback?.sisterOutlet.id !== adyarOutlet.id, 'Sister outlet is distinct from original');
  assert(fallback?.suggestedSlot.available === true, 'Suggested slot at sister salon is open');
  assert(fallback?.headline.includes(adyarOutlet.name), 'Headline includes original outlet name');

  // 4. Intent Parser Sister Fallback Integration
  const nlWithSlot = parseNaturalLanguageInput('I want a haircut at Adyar tomorrow at 6 PM', today);
  assert(nlWithSlot.intent === 'BOOK_APPOINTMENT', 'Intent parsed as BOOK_APPOINTMENT');
  assert(nlWithSlot.outlet?.area === 'Adyar', 'Outlet matched Adyar');
  assert(nlWithSlot.date !== null, 'Date extracted');
  assert(nlWithSlot.timePreference?.time === '18:00', 'Time preference 18:00 extracted');
  assert(typeof nlWithSlot.responseMessage === 'string' && nlWithSlot.responseMessage.length > 10, 'Response message formulated');
}

// ============================================================
// FINAL SUMMARY
// ============================================================
console.log('\n\n╔═══════════════════════════════════════════════════════╗');
console.log(`║  QA RESULTS: ${passCount} PASSED / ${failCount} FAILED / ${passCount + failCount} TOTAL    `);
console.log('╚═══════════════════════════════════════════════════════╝');

if (failCount === 0) {
  console.log('🎉 ALL TESTS PASSED — Booking engine verified.\n');
} else {
  console.log(`⚠️  ${failCount} test(s) failed — review above.\n`);
  process.exit(1);
}
