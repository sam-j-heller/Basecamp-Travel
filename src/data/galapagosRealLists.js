// Real packing data for the "Galápagos & Peru" trip, used once by a temporary
// import button on the trip page. Product/brand names are intentionally
// genericized since this repo is public.
import { makeCategory, makeItem } from '../lib/tripModel'

function category(name, items) {
  const cat = makeCategory(name)
  cat.items = items.map(([itemName, quantity, notes]) => makeItem(itemName, quantity, notes || ''))
  return cat
}

export function recommendedCategories() {
  return [
    category('Documents & Money', [
      ['Passport (6+ months validity)', 1],
      ['Photocopy of passport (packed separately)', 1],
      ['Travel insurance policy printout', 1],
      ['Flight & hotel confirmations (printed/offline)', 1],
      ['Galápagos Transit Card (TCT) receipt', 1],
      ['Galápagos park entry fee cash ($100 USD)', 1],
      ['USD cash, small bills (tips, park fees)', 1],
      ['Credit + backup debit card', 2],
      ['Driver’s license / photo ID', 1],
    ]),
    category('Clothing', [
      ['Quick-dry t-shirts / tops (no cotton)', 10],
      ['Long-sleeve sun shirt, UPF (boat & equator sun)', 2],
      ['Lightweight hiking pants', 3],
      ['Shorts', 3],
      ['Underwear, quick-dry', 15],
      ['Hiking socks, moisture-wicking (no cotton)', 12],
      ['Sleepwear', 3],
    ]),
    category('Layers & Accessories', [
      ['Fleece or midweight insulating layer', 1],
      ['Packable puffy jacket (Andes cold)', 1],
      ['Rain jacket / waterproof shell', 1],
      ['Warm beanie (Andes mornings)', 1],
      ['Lightweight gloves', 1],
      ['Buff / neck gaiter', 1],
      ['Wide-brim sun hat (equator sun)', 1],
      ['Swimsuit', 2],
    ]),
    category('Footwear', [
      ['Hiking shoes/boots, broken in (via ferrata, Rainbow Mtn)', 1],
      ['Comfortable walking sneakers', 1],
      ['Water shoes / sport sandals (snorkel landings)', 1],
    ]),
    category('Water & Snorkel Gear', [
      ['Snorkel mask + snorkel (own fit, optional)', 1],
      ['Rash guard', 1],
      ['Reef-safe sunscreen (mineral)', 1],
      ['Small dry bag for boat excursions', 1],
      ['Waterproof phone pouch', 1],
    ]),
    category('Health & Meds', [
      ['Altitude sickness medication (e.g. Diamox)', 1],
      ['Anti-nausea medication', 1],
      ['Imodium / anti-diarrheal', 1],
      ['Personal prescriptions, extra supply', 1],
      ['Pain reliever (ibuprofen/acetaminophen)', 1],
      ['Electrolyte packets (Liquid IV / Nuun)', 10],
    ]),
    category('Electronics', [
      ['Phone + charger', 1],
      ['Camera + charger + extra batteries/cards', 1],
      ['Power adapter (confirm plug type)', 1],
      ['Portable battery pack', 1],
      ['Headphones', 1],
      ['E-reader / flight entertainment', 1],
    ]),
    category('Dinner Outfits', [
      ['Outfit for La Mar, Lima', 1],
      ['Outfit for Cusco celebration dinner', 1],
      ['Light layer or wrap (Cusco nights are cold)', 1],
    ]),
    category('Daypack & Extras', [
      ['Daypack for excursions & altitude days', 1],
      ['Insulated reusable water bottle', 1],
      ['Travel pillow', 1],
      ['Earplugs & eye mask', 1],
      ['Ziplock bags (snacks, wet items, organization)', 6],
      ['Polarized sunglasses', 1],
      ['Binoculars (Galápagos wildlife)', 1],
    ]),
  ]
}

export function samCategories() {
  return [
    category('Clothing', [
      ['Quick-dry t-shirts', 5, '4 already secured, need 1 more'],
      ['Long-sleeve sun shirt (UPF 50+)', 1, 'Galápagos boat days — equatorial UV is intense at sea level'],
      [
        'Khaki stretch hiking pants',
        1,
        'Runs warm — great for cold Rainbow Mtn/Humantay mornings and doubles as dinner pants',
      ],
      ['Zip-off convertible pants', 1, 'Good for warm 60s-70s°F stretches — Galápagos, Aguas Calientes, Lima'],
      ['Zip-off hiking pants', 1, 'Elastic waist + 4-way stretch for thigh room; adjustable hem as backup for length'],
      ['Shorts', 1, 'Galápagos warm days, Aguas Calientes, Lima'],
      ['Going-out shirt', 1, 'Cusco celebration dinner + La Mar in Lima'],
      ['Underwear', 7, 'Quick-dry synthetic'],
      ['Hiking socks', 7, 'Merino wool — odor control and blister prevention on long hike days'],
      [
        'Insulated jacket (down or synthetic)',
        1,
        'Non-negotiable — Humantay + Rainbow Mountain are cold at 14-16k ft even in August',
      ],
      [
        'Packable rain shell',
        1,
        'Doubles as wind layer at altitude — also covers mist at Machu Picchu’s cloud-forest microclimate',
      ],
      ['Buff / neck gaiter', 1, 'Altitude wind and sun on Rainbow Mountain and Humantay Lake'],
    ]),
    category('Footwear', [
      [
        'Gore-Tex hiking shoes',
        1,
        'Proven on a past big hike — bringing these instead of trail runners; runs a bit warmer on hot/humid legs (Galápagos, Aguas Calientes)',
      ],
      ['Sport sandals', 1, 'Galápagos boat days, Aguas Calientes walkabout, Lima'],
    ]),
    category('Sun & Water', [
      ['High-SPF sunscreen (regular)', 1, 'Bring plenty — Peru high-altitude UV hits hard too'],
      ['Reef-safe sunscreen', 1, 'Required in the Galápagos for snorkel days — non-negotiable at the park'],
      ['Sunglasses (polarized)', 1, 'Preferred for on-water glare'],
      ['Brimmed sun hat', 1, 'Galápagos boat decks and open-air hiking'],
      ['Electrolyte packets', 10, 'Critical at altitude — helps with acclimatization at 14-16k ft'],
      ['Reusable water bottle', 1, 'Fill and treat — stay hydrated at altitude'],
    ]),
    category('Camera', [
      ['Mirrorless camera body', 1, ''],
      ['Standard zoom lens (18-50mm f/2.8)', 1, 'Primary lens — Galápagos wildlife gets close, no reach needed'],
      ['Telephoto lens (70-300mm)', 1, 'Covers Rainbow Mountain and Machu Picchu reach'],
      ['Spare camera batteries', 2, 'Cold kills batteries fast at altitude'],
      ['Memory cards', 1, ''],
      ['Camera wrist strap', 1, ''],
      [
        'Camera cube insert',
        1,
        'Doubles as the waterproof/protective solution for boat spray — fits the body, both lenses, and small accessories',
      ],
    ]),
    category('Health & Meds', [
      ['Anti-nausea meds', 1, 'Lesson from a past trip — bring the strong ones'],
      ['Anti-diarrheal (Imodium etc.)', 1, 'Lesson from a past trip — pack more than you think you’ll need'],
      ['Blister kit (moleskin + bandages)', 1, 'Via ferrata, Huayna Picchu, and multi-day hiking will test your feet'],
      ['Basic first aid', 1, 'Antiseptic, gauze, medical tape'],
    ]),
    category('Gear & Misc', [
      ['Passport + copies (stored separately)', 1, ''],
      [
        'Waterproof fanny pack (1.5L)',
        1,
        'For passport/documents/cash on boat transfers and travel days — keeps them dry and on-body',
      ],
      ['Packing cubes', 1, 'Especially a camera cube for the daypack, to free up the main bag'],
      ['Small padlock', 1, 'For hostel/hotel luggage storage on long day-trip days'],
      ['Power bank (20,000 mAh)', 1, 'Long boat days and full days away from outlets'],
      ['Universal adapter', 1, 'Ecuador + Peru both use US plugs — double check if needed'],
      ['Thick microfiber towel', 1, 'Already upgraded from a past trip'],
      ['USD cash', 1, 'Parents handling group cash this trip, so less needed personally'],
      ['Laundry solution', 1, 'Mesh/compression stuff sack to keep dirty clothes separate over 15 days'],
    ]),
  ]
}
