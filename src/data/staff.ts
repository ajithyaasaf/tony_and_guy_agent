import { Staff } from '@/types';
import { MOCK_OUTLETS } from './outlets';

const STYLIST_NAMES = [
  'Rahul Sharma', 'Priya Menon', 'Kavitha Sundaram', 'Vikramaditya Roy',
  'Ananya Iyer', 'Rohan Mukherjee', 'Sneha Kapoor', 'Arjun Nambiar',
  'Meera Krishnan', 'Deepak Verma', 'Siddharth Rao', 'Pooja Nair',
  'Farhan Akhtar', 'Divya Patel', 'Gaurav Sen', 'Neha Reddy'
];

const ROLES: Staff['role'][] = [
  'Creative Director', 'Top Stylist', 'Senior Stylist', 'Master Colourist', 'Stylist'
];

export const MOCK_STAFF: Staff[] = MOCK_OUTLETS.flatMap((outlet, oIdx) => {
  return [
    {
      id: `stf_${outlet.id}_1`,
      name: STYLIST_NAMES[(oIdx * 3) % STYLIST_NAMES.length],
      outletId: outlet.id,
      role: 'Creative Director',
      experienceYears: 12 + (oIdx % 5),
      specialities: ['Precision Cuts', 'Couture Editorial', 'Balayage'],
      rating: 4.9,
      status: 'active'
    },
    {
      id: `stf_${outlet.id}_2`,
      name: STYLIST_NAMES[(oIdx * 3 + 1) % STYLIST_NAMES.length],
      outletId: outlet.id,
      role: 'Master Colourist',
      experienceYears: 8 + (oIdx % 4),
      specialities: ['Global Fashion Colour', 'Root Melting', 'Olaplex Rituals'],
      rating: 4.8,
      status: 'active'
    },
    {
      id: `stf_${outlet.id}_3`,
      name: STYLIST_NAMES[(oIdx * 3 + 2) % STYLIST_NAMES.length],
      outletId: outlet.id,
      role: 'Senior Stylist',
      experienceYears: 6 + (oIdx % 3),
      specialities: ['Men Grooming', 'Beard Sculpting', 'Fade Cuts'],
      rating: 4.7,
      status: 'active'
    },
    {
      id: `stf_${outlet.id}_4`,
      name: `Alex ${outlet.area.split(' ')[0]}`,
      outletId: outlet.id,
      role: 'Top Stylist',
      experienceYears: 5,
      specialities: ['Keratin Therapy', 'Nanoplastia', 'Blowouts'],
      rating: 4.8,
      status: 'active'
    }
  ];
});
