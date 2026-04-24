const fs = require('fs');

const CATS = [
  { id: 'home', label: 'Home &\nMaintenance', icon: 'home', color: '#2d5a5a', subs: ['Plumber', 'Electrician', 'Painter', 'Carpenter', 'Locksmith', 'Handyman', 'Roofing'], aliases: ['fix', 'repair', 'house', 'build', 'broken', 'reparatie', 'teava', 'acoperis'] },
  { id: 'beauty', label: 'Beauty &\nWellness', icon: 'sparkles', color: '#db2777', subs: ['Hairdresser', 'Nail Tech', 'Massage', 'Makeup', 'Barber'], aliases: ['hair', 'nails', 'skin', 'salon', 'tuns', 'unghii', 'masaj', 'makeup', 'spa'] },
  { id: 'auto', label: 'Auto &\nTransport', icon: 'truck', color: '#d97706', subs: ['Mechanic', 'MOT', 'Valeting', 'Recovery'], aliases: ['car', 'driving', 'vehicle', 'masina', 'mecanic', 'tractare', 'auto'] },
  { id: 'events', label: 'Events', icon: 'party-popper', color: '#7c3aed', subs: ['Photographer', 'DJ', 'Catering', 'Florist', 'Videographer'], aliases: ['party', 'wedding', 'music', 'food', 'petrecere', 'nunta', 'dj', 'foto'] },
  { id: 'edu', label: 'Education', icon: 'book', color: '#059669', subs: ['Maths Tutor', 'Language', 'Music', 'Sports', 'Driving Instructor'], aliases: ['tutor', 'learn', 'school', 'teach', 'meditatii', 'profesor', 'invata'] },
  { id: 'tech', label: 'IT & Tech', icon: 'monitor', color: '#0891b2', subs: ['PC Repair', 'Phone Repair', 'Web Design', 'CCTV'], aliases: ['computer', 'laptop', 'phone', 'website', 'reparatie laptop', 'telefon', 'camera'] },
  { id: 'pets', label: 'Pet Care', icon: 'dog', color: '#ea580c', subs: ['Dog Walking', 'Grooming', 'Pet Sitting', 'Vet', 'Pet Training'], aliases: ['dog', 'cat', 'animal', 'caine', 'pisica', 'tuns catei'] },
  { id: 'health', label: 'Health &\nFitness', icon: 'heart', color: '#dc2626', subs: ['Personal Trainer', 'Yoga', 'Nutritionist', 'Physio'], aliases: ['gym', 'workout', 'diet', 'antrenor', 'fitness', 'nutritie', 'sport'] },
  { id: 'legal', label: 'Legal &\nAdmin', icon: 'scale', color: '#475569', subs: ['Notary', 'Accounting', 'Translation', 'Consulting'], aliases: ['law', 'taxes', 'avocat', 'contabil', 'acte', 'traduceri'] },
  { id: 'garden', label: 'Gardening', icon: 'leaf', color: '#65a30d', subs: ['Lawn Mowing', 'Hedge Trimming', 'Garden Design', 'Tree Surgery'], aliases: ['grass', 'mow', 'cut', 'tree', 'yard', 'plant', 'gradina', 'iarba', 'tuns iarba', 'gazon', 'copaci', 'peisagistica'] },
  { id: 'office', label: 'Home Office', icon: 'briefcase', color: '#1e293b', subs: ['Desk Assembly', 'Network Setup', 'Ergonomics', 'Office Design'], aliases: ['desk', 'chair', 'internet', 'birou', 'mobilier', 'retea'] },
  { id: 'life', label: 'Lifestyle', icon: 'smile', color: '#f59e0b', subs: ['Personal Chef', 'Stylist', 'Life Coach', 'Concierge'], aliases: ['coach', 'chef', 'clothes', 'stilist', 'bucatar'] }
];

const FIRST_NAMES = ['Andrei', 'Mihai', 'Elena', 'Maria', 'Ionut', 'Cristian', 'Ana', 'George', 'Radu', 'Ioana', 'Gabriel', 'Florin', 'Stefan', 'Bogdan', 'Alina', 'Carmen', 'Paul', 'Dan', 'Victor', 'Sorin', 'Razvan', 'Tudor', 'Diana', 'Simona', 'Alexandra'];
const LAST_NAMES = ['Popescu', 'Ionescu', 'Radu', 'Dumitru', 'Stan', 'Stoica', 'Gheorghe', 'Matei', 'Ciobanu', 'Iancu', 'Voinea', 'Lupu', 'Nita', 'Barbu', 'Oprea', 'Dobre', 'Marinescu', 'Enache', 'Stancu', 'Vasile', 'Ilie'];

const IMAGES = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=256&q=80'
];

let generatedCode = `import { Professional } from './types';\n\nexport const GENERATED_PROS: Professional[] = [\n`;

let idCounter = 1000;
CATS.forEach(cat => {
  cat.subs.forEach(sub => {
    // Generate 5 pros for each sub
    for(let i=0; i<5; i++) {
      idCounter++;
      const name = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
      const email = `gen_${idCounter}@test.com`;
      const img = IMAGES[Math.floor(Math.random() * IMAGES.length)];
      const rating = (4.0 + Math.random() * 1.0).toFixed(1);
      const rc = Math.floor(Math.random() * 150) + 10;
      const jobs = Math.floor(rc * (1 + Math.random()));
      const price = Math.floor(Math.random() * 60) + 20;
      const isEm = Math.random() > 0.7;
      const ins = Math.random() > 0.4 ? 1 : 0;
      const dbs = Math.random() > 0.2 ? 1 : 0;

      generatedCode += `  {
    id: 'pro_gen_${idCounter}',
    name: '${name}',
    email: '${email}',
    img: '${img}',
    catId: '${cat.id}',
    sub: '${sub}',
    rating: ${rating},
    rc: ${rc},
    jobs: ${jobs},
    loc: 'Northampton',
    price: ${price},
    unit: '/hr',
    v: { id: 1, dbs: ${dbs}, ins: ${ins} },
    about: 'Professional ${sub} providing top quality services in the local area. Highly experienced and reliable.',
    svcs: ['General ${sub} Service', 'Consultation', 'Full Project'],
    port: [],
    revs: [{ n: 'Customer', rating: 5, text: 'Great service, highly recommend!', date: '1w ago' }],
    slots: [{ day: 'Mon', dt: '14 Jul', times: ['9 AM', '2 PM'] }, { day: 'Wed', dt: '16 Jul', times: ['10 AM'] }],
    isEmergencyAvailable: ${isEm}
  },\n`;
    }
  });
});

generatedCode += `];\n`;

fs.writeFileSync('src/generatedPros.ts', generatedCode);
console.log('generatedPros.ts created successfully!');
