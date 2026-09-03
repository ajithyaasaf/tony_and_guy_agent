import { ServiceCategory, Service } from '@/types';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'cat_haircut', name: 'Haircuts & Styling', slug: 'haircuts', description: 'Precision cuts tailored by TONI&GUY creative directors and stylists.', sortOrder: 1 },
  { id: 'cat_colour', name: 'Hair Colour & Balayage', slug: 'colour', description: 'Bespoke highlights, balayage, glossing, and global fashion transformations.', sortOrder: 2 },
  { id: 'cat_spa_treatments', name: 'Hair Spa & Scalp Therapy', slug: 'spa-treatments', description: 'Intensive restorative care, Kérastase rituals, and scalp rejuvenation.', sortOrder: 3 },
  { id: 'cat_texture', name: 'Keratin & Texture Care', slug: 'texture', description: 'Cysteine smoothing, nanoplastia, botox hair treatments, and rebonding.', sortOrder: 4 },
  { id: 'cat_mens_grooming', name: "Men's Grooming", slug: 'mens-grooming', description: 'Beard sculpting, executive cleanups, precision fade styling, and scalp care.', sortOrder: 5 },
  { id: 'cat_skin_facials', name: 'Skin Care & Sothys Facials', slug: 'skin-facials', description: 'French Sothys Paris rituals, brightening cleanups, and anti-aging treatments.', sortOrder: 6 },
  { id: 'cat_hands_feet', name: 'Hands & Feet Lounge', slug: 'hands-feet', description: 'Deluxe pedicures, manicures, reflexology, and gel nail artistry.', sortOrder: 7 },
  { id: 'cat_waxing_threading', name: 'Waxing & Threading', slug: 'waxing-threading', description: 'Premium Rica waxing, full body care, and brow architectural mapping.', sortOrder: 8 },
];

export const MOCK_SERVICES: Service[] = [
  // Haircuts & Styling
  {
    id: 'srv_men_haircut',
    name: "Men's Classic Haircut",
    categoryId: 'cat_haircut',
    categoryName: 'Haircuts & Styling',
    description: 'Bespoke consultation, precision scissor and clipper haircut, invigorating wash, and editorial blowout styling.',
    price: 850,
    durationMinutes: 45,
    audience: 'men',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_women_haircut',
    name: "Women's Creative Haircut",
    categoryId: 'cat_haircut',
    categoryName: 'Haircuts & Styling',
    description: 'Couture diagnostic consultation, signature TONI&GUY sectioning haircut, luxury wash, and high-fashion finish.',
    price: 1550,
    durationMinutes: 60,
    audience: 'women',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_director_cut_women',
    name: "Creative Director Haircut (Women)",
    categoryId: 'cat_haircut',
    categoryName: 'Haircuts & Styling',
    description: 'Master-level haircut executed exclusively by a certified TONI&GUY Creative Director.',
    price: 2400,
    durationMinutes: 75,
    audience: 'women',
    popular: false,
    status: 'active'
  },
  {
    id: 'srv_blowdry_style',
    name: 'Blow Dry & Signature Styling',
    categoryId: 'cat_haircut',
    categoryName: 'Haircuts & Styling',
    description: 'Volume, sleek straight, beach waves, or glamour curls tailored to your event with heat protection.',
    price: 950,
    durationMinutes: 45,
    audience: 'women',
    popular: false,
    status: 'active'
  },
  {
    id: 'srv_kids_cut',
    name: "Junior Haircut (Under 12)",
    categoryId: 'cat_haircut',
    categoryName: 'Haircuts & Styling',
    description: 'Gentle, modern cut designed for young trendsetters with light styling.',
    price: 650,
    durationMinutes: 30,
    audience: 'unisex',
    popular: false,
    status: 'active'
  },

  // Hair Colour
  {
    id: 'srv_global_colour_women',
    name: "Women's Global Hair Colour",
    categoryId: 'cat_colour',
    categoryName: 'Hair Colour & Balayage',
    description: 'L’Oréal Professionnel / Wella luxury root-to-tip ammonia-free uniform vibrant colour.',
    price: 3800,
    durationMinutes: 90,
    audience: 'women',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_root_touchup',
    name: 'Root Touch Up (Women)',
    categoryId: 'cat_colour',
    categoryName: 'Hair Colour & Balayage',
    description: 'Regrowth coverage up to 2 inches with seamless tone matching and conditioning rinse.',
    price: 2200,
    durationMinutes: 60,
    audience: 'women',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_balayage_ombre',
    name: 'Couture Balayage / Highlights',
    categoryId: 'cat_colour',
    categoryName: 'Hair Colour & Balayage',
    description: 'Hand-painted sun-kissed gradients, dimension babylights, and customized gloss toner.',
    price: 6500,
    durationMinutes: 150,
    audience: 'women',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_men_global_colour',
    name: "Men's Global Hair Colour",
    categoryId: 'cat_colour',
    categoryName: 'Hair Colour & Balayage',
    description: 'Natural grey blending or bold global tone formulated specifically for short hair textures.',
    price: 1800,
    durationMinutes: 45,
    audience: 'men',
    popular: false,
    status: 'active'
  },

  // Spa & Treatments
  {
    id: 'srv_hair_spa',
    name: 'Intensive Restorative Hair Spa',
    categoryId: 'cat_spa_treatments',
    categoryName: 'Hair Spa & Scalp Therapy',
    description: 'Deep fiber nourishment, relaxing acupressure scalp massage, micro-mist ozone infusion, and serum seal.',
    price: 1850,
    durationMinutes: 50,
    audience: 'unisex',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_kerastase_ritual',
    name: 'Kérastase Chronologiste Luxury Ritual',
    categoryId: 'cat_spa_treatments',
    categoryName: 'Hair Spa & Scalp Therapy',
    description: 'The ultimate anti-aging youth revitalizing treatment infused with Abyssine and Hyaluronic Acid.',
    price: 3600,
    durationMinutes: 60,
    audience: 'unisex',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_olaplex_bonding',
    name: 'Olaplex Bond Multiplier Standalone',
    categoryId: 'cat_spa_treatments',
    categoryName: 'Hair Spa & Scalp Therapy',
    description: 'Rebuilds broken disulphide bonds to dramatically restore damaged, bleached, or heat-fatigued strands.',
    price: 2500,
    durationMinutes: 45,
    audience: 'unisex',
    popular: false,
    status: 'active'
  },

  // Keratin & Texture
  {
    id: 'srv_keratin_treatment',
    name: 'Smoothing Keratin Complex',
    categoryId: 'cat_texture',
    categoryName: 'Keratin & Texture Care',
    description: 'Frizz-free silk finish, high shine, and manageable smoothness lasting up to 4 months.',
    price: 6900,
    durationMinutes: 180,
    audience: 'women',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_botox_hair',
    name: 'Nanoplastia / Hair Botox Plumping',
    categoryId: 'cat_texture',
    categoryName: 'Keratin & Texture Care',
    description: 'Formaldehyde-free organic amino acid infusion restoring hair elasticity and glass shine.',
    price: 7500,
    durationMinutes: 180,
    audience: 'women',
    popular: false,
    status: 'active'
  },

  // Men's Grooming
  {
    id: 'srv_beard_trim',
    name: 'Beard Shape-Up & Hot Towel Trim',
    categoryId: 'cat_mens_grooming',
    categoryName: "Men's Grooming",
    description: 'Razor edge definition, hot eucalyptus towel compression, beard conditioning oil, and balm.',
    price: 550,
    durationMinutes: 30,
    audience: 'men',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_beard_spa',
    name: 'Luxury Royal Beard Spa',
    categoryId: 'cat_mens_grooming',
    categoryName: "Men's Grooming",
    description: 'Steam pore opening, deep conditioning mask, high-frequency stimulation, and precision grooming.',
    price: 950,
    durationMinutes: 40,
    audience: 'men',
    popular: false,
    status: 'active'
  },
  {
    id: 'srv_men_head_massage',
    name: 'Invigorating Scalp & Neck Massage',
    categoryId: 'cat_mens_grooming',
    categoryName: "Men's Grooming",
    description: 'Warm essential oil therapeutic massage relieving stress and promoting healthy follicles.',
    price: 750,
    durationMinutes: 30,
    audience: 'men',
    popular: false,
    status: 'active'
  },

  // Skin Care & Facials
  {
    id: 'srv_sothys_cleanup',
    name: 'Sothys Paris Express Cleanup',
    categoryId: 'cat_skin_facials',
    categoryName: 'Skin Care & Sothys Facials',
    description: 'French botanical cleanse, exfoliation, blackhead extraction, soothing pore-minimizing mask.',
    price: 1950,
    durationMinutes: 45,
    audience: 'unisex',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_brightening_facial',
    name: 'Hydra-Brightening Radiance Facial',
    categoryId: 'cat_skin_facials',
    categoryName: 'Skin Care & Sothys Facials',
    description: 'Multi-step infusion with Vitamin C, hyaluronic serum, ultrasonic deep cleansing, and cryo globe massage.',
    price: 3400,
    durationMinutes: 60,
    audience: 'unisex',
    popular: true,
    status: 'active'
  },

  // Hands & Feet
  {
    id: 'srv_deluxe_pedicure',
    name: 'Deluxe Relaxing Pedicure',
    categoryId: 'cat_hands_feet',
    categoryName: 'Hands & Feet Lounge',
    description: 'Sea salt soak, callus smoothing, dead skin scrub, paraffin moisturising mask, and cuticle care.',
    price: 1350,
    durationMinutes: 50,
    audience: 'unisex',
    popular: true,
    status: 'active'
  },
  {
    id: 'srv_deluxe_manicure',
    name: 'Deluxe Spa Manicure',
    categoryId: 'cat_hands_feet',
    categoryName: 'Hands & Feet Lounge',
    description: 'Nail shaping, gentle cuticle care, brightening hand peel, and relaxing arm massage.',
    price: 1050,
    durationMinutes: 40,
    audience: 'unisex',
    popular: false,
    status: 'active'
  },

  // Waxing & Threading
  {
    id: 'srv_full_waxing_combo',
    name: 'Full Arms + Full Legs + Underarms (Rica Wax)',
    categoryId: 'cat_waxing_threading',
    categoryName: 'Waxing & Threading',
    description: 'Colophony-free Italian Rica wax suitable for hypersensitive skin, includes soothing post-wax serum.',
    price: 2200,
    durationMinutes: 60,
    audience: 'women',
    popular: true,
    status: 'active'
  }
];
