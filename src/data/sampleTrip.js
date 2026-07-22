// A starter packing list for a Galápagos + Peru trip, used by the
// "Load Galápagos & Peru starter list" button on an empty dashboard.
import { makeCategory, makeItem } from '../lib/tripModel'

function category(name, items) {
  const cat = makeCategory(name)
  cat.items = items.map(([itemName, quantity, notes]) => makeItem(itemName, quantity, notes || ''))
  return cat
}

export const sampleTrip = {
  name: 'Galápagos & Peru',
  startDate: '',
  endDate: '',
  themeColor: '#2f6f70',
  themeMotif: 'jungle',
  categories: [
    category('Luggage & Packing', [
      ['Osprey Farpoint 40 (main bag)', 1, ''],
      ['Gregory Citro 30 H2O (daypack)', 1, 'Bladder for Andes hikes'],
      ['Camera cube insert', 1, 'Fits inside daypack'],
      ['Packing cubes', 3, 'Clean / dirty / base layers'],
      ['Dry bag / stuff sack', 1, 'Galápagos wet landings'],
      ['Luggage lock', 2, ''],
    ]),
    category('Clothing & Layers', [
      ['Merino t-shirts', 4, ''],
      ['Quick-dry long-sleeve shirts (sun protection)', 2, ''],
      ['Merino base layer top', 1, 'Andes cold mornings/nights'],
      ['Merino base layer bottoms', 1, ''],
      ['Convertible hiking pants', 2, ''],
      ['Quick-dry shorts', 2, ''],
      ['Fleece / midlayer', 1, ''],
      ['Packable insulated jacket', 1, 'Cusco & Machu Picchu altitude cold'],
      ['Rain shell', 1, ''],
      ['Swimsuits', 2, 'Galápagos snorkeling'],
      ['Rash guard', 1, 'Sun protection while snorkeling'],
      ['Underwear', 7, ''],
      ['Wool hiking socks', 5, ''],
      ['Casual socks', 3, ''],
      ['Sleepwear', 1, ''],
      ['Wide-brim sun hat', 1, ''],
      ['Warm beanie', 1, 'Andes evenings'],
      ['Buff / neck gaiter', 1, ''],
      ['Lightweight gloves', 1, 'Cusco mornings'],
      ['Hiking shoes/boots', 1, ''],
      ['Water sandals (Tevas/Chacos)', 1, 'Wet landings'],
      ['Comfortable walking shoes', 1, ''],
    ]),
    category('Nice-Dinner Outfit', [
      ['Dressy top/shirt', 1, 'La Mar Lima dinner'],
      ['Nice trousers or skirt', 1, ''],
      ['Compact dress shoes / flats', 1, ''],
      ['Belt', 1, ''],
      ['Light jewelry/accessories', 1, 'Cusco celebration dinner'],
    ]),
    category('Toiletries', [
      ['Reef-safe sunscreen SPF 50', 1, 'Required in Galápagos — no oxybenzone/octinoxate'],
      ['Lip balm with SPF', 1, ''],
      ['Insect repellent', 1, ''],
      ['Travel toothbrush & toothpaste', 1, ''],
      ['Biodegradable soap/shampoo', 1, ''],
      ['Quick-dry towel', 1, ''],
      ['Hand sanitizer', 1, ''],
    ]),
    category('Health & Altitude', [
      ['Altitude sickness medication (Diamox)', 1, 'For Cusco / Andes portion'],
      ['Coca tea bags / candy', 1, 'Local altitude remedy in Cusco'],
      ['Electrolyte tablets', 1, ''],
      ['Personal prescriptions', 1, ''],
      ['Motion sickness tablets', 1, 'Galápagos boat crossings'],
      ['Small first aid kit', 1, ''],
      ['Hand warmers', 2, 'Early Machu Picchu mornings'],
    ]),
    category('Electronics & Camera', [
      ['Camera body', 1, ''],
      ['Camera lenses', 2, 'Zoom for wildlife, wide for landscapes'],
      ['Extra camera batteries', 3, ''],
      ['Memory cards', 3, ''],
      ['Phone + charger', 1, ''],
      ['Universal travel adapter', 1, 'Ecuador & Peru: Type A/B, 110-120V'],
      ['Portable battery pack', 1, ''],
      ['Waterproof phone pouch', 1, 'Wet landings & snorkeling'],
      ['Headlamp', 1, 'Early Andes departures'],
      ['GoPro / action camera', 1, 'Snorkeling'],
    ]),
    category('Documents & Money', [
      ['Passport', 1, ''],
      ['Passport photocopies', 2, ''],
      ['Travel insurance documents', 1, ''],
      ['Flight & tour itinerary printouts', 1, ''],
      ['Galápagos National Park entry fee cash', 1, '$100 USD cash, per person'],
      ['Local currency (soles / USD)', 1, ''],
      ['Credit/debit cards', 2, ''],
      ['Emergency contact info', 1, ''],
    ]),
  ],
}
