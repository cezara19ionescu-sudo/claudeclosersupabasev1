import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Clock, Calendar, DollarSign, Wrench, Zap, Sparkles, Home, Hammer, Droplets, Paintbrush, Scissors, Camera, Utensils, Music, GraduationCap, Monitor, Dog, Heart, Scale, Leaf, Briefcase, Smile, Star, Car, Truck, Flower, Video, Globe, Clipboard, Smartphone, Shield, TreeDeciduous, Brain } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchSurveyProps {
  subcategory: string;
  onComplete: (data: any) => void;
  onClose: () => void;
}

const SURVEY_CONFIG: Record<string, any> = {
  'Plumber': {
    icon: Droplets,
    color: '#2d5a5a',
    questions: [
      {
        id: 'problem',
        title: 'Ce problemă ai?',
        options: ['Scurgere/Țeavă spartă', 'Toaletă înfundată', 'Instalare chiuvetă/baterie', 'Centrală/Boiler', 'Altceva']
      },
      {
        id: 'urgency',
        title: 'Cât de urgent este?',
        options: ['Imediat (Urgență)', 'În următoarele 2 zile', 'Săptămâna aceasta', 'Sunt flexibil']
      }
    ]
  },
  'Electrician': {
    icon: Zap,
    color: '#f59e0b',
    questions: [
      {
        id: 'job_type',
        title: 'Ce tip de lucrare este?',
        options: ['Reparație/Scurtcircuit', 'Montaj prize/întrerupătoare', 'Tablou electric', 'Instalație nouă', 'Corpuri de iluminat']
      },
      {
        id: 'urgency',
        title: 'Când ai nevoie?',
        options: ['ASAP', 'Azi/Mâine', 'Săptămâna viitoare', 'Doar cotație momentan']
      }
    ]
  },
  'Painter': {
    icon: Paintbrush,
    color: '#db2777',
    questions: [
      {
        id: 'scope',
        title: 'Ce dorești să vopsești?',
        options: ['O singură cameră', 'Întregul apartament', 'Casă interior/exterior', 'Doar retușuri', 'Pereți exteriori']
      },
      {
        id: 'condition',
        title: 'Starea pereților?',
        options: ['Bună (doar vopsea)', 'Necesită glet/reparații', 'Tapet de îndepărtat', 'Casă nouă (la gri)']
      }
    ]
  },
  'Carpenter': {
    icon: Hammer,
    color: '#92400e',
    questions: [
      {
        id: 'service',
        title: 'Ce tip de lucrare ai?',
        options: ['Mobilier la comandă', 'Montaj uși/ferestre', 'Reparație mobilier', 'Podele/Parchet', 'Altceva']
      },
      {
        id: 'material',
        title: 'Ai deja materialele?',
        options: ['Da, le am', 'Nu, am nevoie de consultanță', 'Vreau să le cumpere pro-ul']
      }
    ]
  },
  'Locksmith': {
    icon: Lock,
    color: '#475569',
    questions: [
      {
        id: 'problem',
        title: 'Care este urgența?',
        options: ['Sunt blocat afară', 'Schimbare yală/butuc', 'Reparație ușă/mâner', 'Instalare încuietoare smart']
      },
      {
        id: 'door_type',
        title: 'Tipul ușii?',
        options: ['Metal (Apartament)', 'Lemn (Interior)', 'Termopan/PVC', 'Poartă/Garaj']
      }
    ]
  },
  'Handyman': {
    icon: Wrench,
    color: '#1e293b',
    questions: [
      {
        id: 'task',
        title: 'Ce trebuie făcut?',
        options: ['Montaj TV/Rafturi', 'Asamblare mobilă IKEA', 'Mici reparații electrice/sanitare', 'Mentenanță generală']
      },
      {
        id: 'time',
        title: 'Estimare timp?',
        options: ['Sub 1 oră', '2-4 ore', 'O zi întreagă', 'Nu știu sigur']
      }
    ]
  },
  'Roofing': {
    icon: Home,
    color: '#b91c1c',
    questions: [
      {
        id: 'issue',
        title: 'Problema acoperișului?',
        options: ['Infiltrații/Scurgeri', 'Țigle lipsă/rupte', 'Curățare jgheaburi', 'Izolație/Renovare completă']
      },
      {
        id: 'building',
        title: 'Tipul clădirii?',
        options: ['Casă individuală', 'Bloc/Apartament', 'Garaj/Anexă', 'Spațiu comercial']
      }
    ]
  },
  'Cleaner': {
    icon: Sparkles,
    color: '#06b6d4',
    questions: [
      {
        id: 'type',
        title: 'Ce tip de curățenie?',
        options: ['Întreținere (regular)', 'Generală (deep clean)', 'După constructor', 'Canapele/Covoare', 'Geamuri']
      },
      {
        id: 'size',
        title: 'Mărimea spațiului?',
        options: ['Garsonieră/1 Cameră', '2 Camere', '3-4 Camere', 'Casă/Vilă', 'Spațiu comercial']
      }
    ]
  },
  'Hairdresser': {
    icon: Scissors,
    color: '#ec4899',
    questions: [
      {
        id: 'service',
        title: 'Ce serviciu cauți?',
        options: ['Tuns', 'Vopsit', 'Coafat/Styling', 'Balayage', 'Tratament păr']
      },
      {
        id: 'location',
        title: 'Unde preferi?',
        options: ['La salon', 'La domiciliul meu', 'Nu contează']
      }
    ]
  },
  'Barber': {
    icon: Scissors,
    color: '#1e293b',
    questions: [
      {
        id: 'style',
        title: 'Ce dorești?',
        options: ['Tuns clasic', 'Fade / Skin Fade', 'Tuns barbă', 'Tuns + Barbă', 'Contur / Aranjat']
      }
    ]
  },
  'Nail Tech': {
    icon: Sparkles,
    color: '#f472b6',
    questions: [
      {
        id: 'service',
        title: 'Tipul manichiurii?',
        options: ['Geluț (Semi)', 'Construcție Gel', 'Întreținere', 'Manichiură clasică', 'Pedichiură']
      }
    ]
  },
  'Massage': {
    icon: Heart,
    color: '#8b5cf6',
    questions: [
      {
        id: 'type',
        title: 'Ce tip de masaj?',
        options: ['Relaxare', 'Terapeutic/Medical', 'Deep Tissue', 'Anticelulitic', 'Sportiv']
      },
      {
        id: 'duration',
        title: 'Durata dorită?',
        options: ['50 minute', '90 minute', '120 minute']
      }
    ]
  },
  'Mechanic': {
    icon: Car,
    color: '#d97706',
    questions: [
      {
        id: 'problem',
        title: 'Ce problemă are mașina?',
        options: ['Revizie/Ulei/Filtre', 'Frâne/Suspensie', 'Motor/Ambreiaj', 'Diagnosticare martor bord', 'Altceva']
      },
      {
        id: 'brand',
        title: 'Marca mașinii?',
        options: ['Audi/BMW/Merc', 'VW/Skoda/Seat', 'Dacia/Renault', 'Ford/Opel', 'Altă marcă']
      }
    ]
  },
  'MOT': {
    icon: Clipboard,
    color: '#059669',
    questions: [
      {
        id: 'type',
        title: 'Categorie vehicul?',
        options: ['Turism (B)', 'Motocicletă (A)', 'Utilitară (C/D)']
      },
      {
        id: 'expiry',
        title: 'Când expiră ITP-ul?',
        options: ['A expirat deja', 'Săptămâna aceasta', 'Luna aceasta', 'Vreau doar o programare']
      }
    ]
  },
  'Recovery': {
    icon: Truck,
    color: '#dc2626',
    questions: [
      {
        id: 'situation',
        title: 'Unde ești?',
        options: ['Blocat în trafic', 'La domiciliu', 'Accident (necesită platformă)', 'În afara orașului']
      },
      {
        id: 'dest',
        title: 'Unde trebuie dusă?',
        options: ['Cel mai apropiat service', 'La o adresă specifică', 'Nu știu încă']
      }
    ]
  },
  'Transport Auto': {
    icon: Truck,
    color: '#d97706',
    questions: [
      {
        id: 'car_type',
        title: 'Ce tip de auto trebuie transportat?',
        options: ['Auto Mic/Berlina', 'SUV/4x4', 'Duba/Utilitara', 'Masina Sport/Joasa', 'Motocicleta']
      },
      {
        id: 'distance',
        title: 'Ce tip de transport dorești?',
        options: ['Local (în oraș)', 'Interurban (între orașe)', 'Internațional', 'Transport pe platformă închisă']
      },
      {
        id: 'condition',
        title: 'Starea vehiculului?',
        options: ['Funcțional (porneste/merge)', 'Defect (nu porneste)', 'Avariat/Dauna totala', 'Fara roti/Blocat']
      }
    ]
  },
  'Photographer': {
    icon: Camera,
    color: '#7c3aed',
    questions: [
      {
        id: 'event',
        title: 'Pentru ce eveniment?',
        options: ['Nuntă/Botez', 'Ședință foto (Solo/Cuplu)', 'Eveniment corporate', 'Product photography', 'Majorat/Party']
      },
      {
        id: 'hours',
        title: 'Câte ore ai nevoie?',
        options: ['1-2 ore', '3-5 ore', 'Toată ziua', 'Mai multe zile']
      }
    ]
  },
  'DJ': {
    icon: Music,
    color: '#10b981',
    questions: [
      {
        id: 'vibe',
        title: 'Genul muzical preferat?',
        options: ['Comercial / Top Hits', 'Electronic / Techno', 'Retro / 80s-90s', 'Rock / Alternative', 'Mix de toate']
      },
      {
        id: 'equipment',
        title: 'Ai nevoie de sonorizare?',
        options: ['Da, sonorizare completă', 'Nu, locația are boxe', 'Vreau și lumini/efecte']
      }
    ]
  },
  'Catering': {
    icon: Utensils,
    color: '#f97316',
    questions: [
      {
        id: 'guests',
        title: 'Număr de persoane?',
        options: ['10-20', '20-50', '50-100', 'Peste 100']
      },
      {
        id: 'style',
        title: 'Stilul servirii?',
        options: ['Bufet suedez', 'Meniu la farfurie', 'Finger food / Candy bar', 'Doar livrare mâncare']
      }
    ]
  },
  'Maths Tutor': {
    icon: GraduationCap,
    color: '#2563eb',
    questions: [
      {
        id: 'level',
        title: 'Nivelul elevului?',
        options: ['Școala generală', 'Liceu (BAC)', 'Facultate', 'Olimpiade/Performanță']
      },
      {
        id: 'mode',
        title: 'Formatul lecțiilor?',
        options: ['Online', 'La domiciliul meu', 'La profesor']
      }
    ]
  },
  'Language': {
    icon: Globe,
    color: '#3b82f6',
    questions: [
      {
        id: 'lang',
        title: 'Ce limbă dorești?',
        options: ['Engleză', 'Germană', 'Franceză', 'Spaniolă', 'Altă limbă']
      },
      {
        id: 'purpose',
        title: 'Scopul învățării?',
        options: ['Conversație', 'Business', 'Examene (IELTS/DELF)', 'De la zero']
      }
    ]
  },
  'PC Repair': {
    icon: Monitor,
    color: '#0891b2',
    questions: [
      {
        id: 'issue',
        title: 'Care este problema?',
        options: ['Nu pornește', 'Ecran spart/defect', 'Curățare/Mentenanță', 'Recuperare date/Virusi', 'Upgrade componente']
      },
      {
        id: 'device',
        title: 'Ce tip de dispozitiv?',
        options: ['Laptop', 'Desktop (PC)', 'Apple Mac/MacBook', 'Gaming Console']
      }
    ]
  },
  'Lawn Mowing': {
    icon: Leaf,
    color: '#10b981',
    questions: [
      {
        id: 'frequency',
        title: 'Cât de des ai nevoie?',
        options: ['O singură dată', 'Săptămânal', 'La 2 săptămâni', 'Lunar']
      },
      {
        id: 'area',
        title: 'Suprafața aproximativă?',
        options: ['Mică (<100 mp)', 'Medie (100-500 mp)', 'Mare (500-1000 mp)', 'Foarte mare (>1000 mp)']
      }
    ]
  },
  'Dog Walking': {
    icon: Dog,
    color: '#ea580c',
    questions: [
      {
        id: 'size',
        title: 'Talia câinelui?',
        options: ['Mică (<10 kg)', 'Medie (10-25 kg)', 'Mare (>25 kg)']
      },
      {
        id: 'walks',
        title: 'Câte plimbări pe zi?',
        options: ['O plimbare', 'Două plimbări', 'Doar ocazional']
      }
    ]
  },
  'Accounting': {
    icon: Briefcase,
    color: '#475569',
    questions: [
      {
        id: 'entity',
        title: 'Tipul entității?',
        options: ['SRL', 'PFA / II', 'Persoană fizică', 'ONG']
      },
      {
        id: 'service',
        title: 'Ce ai nevoie?',
        options: ['Contabilitate lunară', 'Declarația unică', 'Salarizare/HR', 'Înființare firmă']
      }
    ]
  },
  'Florist': {
    icon: Flower,
    color: '#be185d',
    questions: [
      {
        id: 'occassion',
        title: 'Pentru ce ocazie?',
        options: ['Aranjament cadou', 'Nuntă / Eveniment', 'Buchet de mireasă', 'Coroană / Funerar']
      }
    ]
  },
  'Videographer': {
    icon: Video,
    color: '#ef4444',
    questions: [
      {
        id: 'type',
        title: 'Tipul filmării?',
        options: ['Wedding Video', 'Content Social Media', 'Interviu / Podcast', 'Aftermovie eveniment']
      }
    ]
  },
  'Yoga': {
    icon: Heart,
    color: '#10b981',
    questions: [
      {
        id: 'level',
        title: 'Nivelul tău?',
        options: ['Începător', 'Intermediar', 'Avansat']
      },
      {
        id: 'mode',
        title: 'Tipul ședinței?',
        options: ['Privată (1-la-1)', 'Grup mic', 'Online']
      }
    ]
  },
  'Garden Design': {
    icon: Leaf,
    color: '#15803d',
    questions: [
      {
        id: 'scope',
        title: 'Ce dorești să amenajezi?',
        options: ['Grădină completă', 'Terasa / Balcon', 'Sistem irigații', 'Gazon / Plante noi']
      }
    ]
  },
  'Personal Chef': {
    icon: Utensils,
    color: '#b45309',
    questions: [
      {
        id: 'event',
        title: 'Pentru ce eveniment?',
        options: ['Cină privată', 'Meal Prep săptămânal', 'Petrecere privată', 'Curs de gătit']
      }
    ]
  },
  'Desk Assembly': {
    icon: Hammer,
    color: '#475569',
    questions: [
      {
        id: 'items',
        title: 'Câte piese de mobilier?',
        options: ['O singură piesă', '2-3 piese', 'Birou complet / Office', 'Mai mult de 5']
      }
    ]
  },
  'Network Setup': {
    icon: Globe,
    color: '#2563eb',
    questions: [
      {
        id: 'scope',
        title: 'Ce problemă ai?',
        options: ['Extindere semnal Wi-Fi', 'Configurare router nou', 'Cablare rețea (LAN)', 'Probleme viteză/stabilitate']
      }
    ]
  },
  'Phone Repair': {
    icon: Smartphone,
    color: '#1e293b',
    questions: [
      {
        id: 'issue',
        title: 'Ce s-a întâmplat?',
        options: ['Ecran spart', 'Baterie (nu ține)', 'Mufă încărcare / Sunet', 'Contact cu apă / Nu pornește']
      }
    ]
  },
  'CCTV': {
    icon: Shield,
    color: '#b91c1c',
    questions: [
      {
        id: 'service',
        title: 'Ce cauți?',
        options: ['Instalare sistem nou', 'Mentenanță / Reparație', 'Upgrade camere', 'Acces de la distanță (pe tel)']
      }
    ]
  },
  'Tree Surgery': {
    icon: TreeDeciduous,
    color: '#15803d',
    questions: [
      {
        id: 'task',
        title: 'Ce trebuie făcut?',
        options: ['Tăiere completă copac', 'Toaletare crengi', 'Scoatere rădăcină (buturugă)', 'Copac periculos (după furtună)']
      }
    ]
  },
  'Hedge Trimming': {
    icon: Scissors,
    color: '#166534',
    questions: [
      {
        id: 'height',
        title: 'Înălțimea gardului viu?',
        options: ['Mic (< 1m)', 'Mediu (1-2m)', 'Înalt (> 2m)']
      }
    ]
  },
  'Personal Trainer': {
    icon: Heart,
    color: '#dc2626',
    questions: [
      {
        id: 'goal',
        title: 'Care este obiectivul?',
        options: ['Slăbit / Tonifiere', 'Masă musculară', 'Condiție fizică / Sănătate', 'Reabilitare post-accidentare']
      }
    ]
  },
  'Nutritionist': {
    icon: Utensils,
    color: '#059669',
    questions: [
      {
        id: 'goal',
        title: 'Ce dorești să obții?',
        options: ['Plan alimentar personalizat', 'Scădere în greutate', 'Nutriție sportivă', 'Probleme digestive/alergii']
      }
    ]
  },
  'Notary': {
    icon: Scale,
    color: '#475569',
    questions: [
      {
        id: 'service',
        title: 'Ce tip de act ai?',
        options: ['Declarații / Procuri', 'Contract vânzare-cumpărare', 'Legalizări copii', 'Succesiuni / Testamente']
      }
    ]
  },
  'Web Design': {
    icon: Monitor,
    color: '#2563eb',
    questions: [
      {
        id: 'project',
        title: 'Tipul proiectului?',
        options: ['Site prezentare (1-5 pag)', 'Magazin online (E-commerce)', 'Landing Page / Portfolio', 'Mentenanță site existent']
      }
    ]
  },
  'Grooming': {
    icon: Scissors,
    color: '#ea580c',
    questions: [
      {
        id: 'pet',
        title: 'Ce animal aveți?',
        options: ['Câine talie mică', 'Câine talie medie/mare', 'Pisică', 'Iepure/Altele']
      },
      {
        id: 'service',
        title: 'Ce serviciu doriți?',
        options: ['Tuns complet', 'Spălat + Periat', 'Tăiat unghii / Curățat urechi', 'Pachet complet']
      }
    ]
  },
  'Stylist': {
    icon: Sparkles,
    color: '#db2777',
    questions: [
      {
        id: 'service',
        title: 'Cum te putem ajuta?',
        options: ['Personal Shopping', 'Analiză garderobă', 'Styling eveniment', 'Culoare & Stil']
      }
    ]
  },
  'Life Coach': {
    icon: Brain,
    color: '#7c3aed',
    questions: [
      {
        id: 'focus',
        title: 'Aria de interes?',
        options: ['Carieră / Business', 'Relații / Personal', 'Încredere în sine', 'Echilibru viață-muncă']
      }
    ]
  },
  'Concierge': {
    icon: Smile,
    color: '#f59e0b',
    questions: [
      {
        id: 'help',
        title: 'Cu ce te putem ajuta?',
        options: ['Rezervări restaurante/bilete', 'Organizare călătorii', 'Task-uri administrative', 'Cadouri & Shopping']
      }
    ]
  },
  'Ergonomics': {
    icon: Monitor,
    color: '#475569',
    questions: [
      {
        id: 'setup',
        title: 'Ce dorești să optimizezi?',
        options: ['Scaunul de birou', 'Înălțimea monitorului', 'Postura generală', 'Setup complet Work from Home']
      }
    ]
  },
  'Office Design': {
    icon: Briefcase,
    color: '#1e293b',
    questions: [
      {
        id: 'space',
        title: 'Tipul spațiului?',
        options: ['Birou acasă (Home Office)', 'Spațiu corporate', 'Co-working space']
      }
    ]
  }
};

const DEFAULT_CONFIG = {
  icon: Sparkles,
  color: '#2d5a5a',
  questions: [
    {
      id: 'details',
      title: 'Cum te putem ajuta?',
      options: ['Reparație/Intervenție rapidă', 'Instalare/Montaj', 'Mentenanță periodică', 'Proiect complet/Renovare']
    },
    {
      id: 'urgency',
      title: 'Cât de repede ai nevoie?',
      options: ['Urgent (Azi)', 'Zilele următoare', 'Săptămâna viitoare', 'Sunt flexibil']
    }
  ]
};

export function SearchSurvey({ subcategory, onComplete, onClose }: SearchSurveyProps) {
  const config = SURVEY_CONFIG[subcategory] || DEFAULT_CONFIG;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const Icon = config.icon;

  const currentQuestion = config.questions[step];
  const isLastStep = step === config.questions.length - 1;

  const handleOptionClick = (option: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);

    if (isLastStep) {
      onComplete(newAnswers);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const progress = ((step + 1) / config.questions.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Project Discovery</span>
          <span className="text-[14px] font-bold text-slate-800">{subcategory}</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100 relative overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-500"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center">
        <div 
          className="w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-teal-900/10"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <Icon className="w-8 h-8" style={{ color: config.color }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md text-center"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-8 leading-tight">
              {currentQuestion.title}
            </h2>

            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] group flex items-center justify-between",
                    answers[currentQuestion.id] === opt 
                      ? "border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/10" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <span className={cn(
                    "text-[15px] font-bold transition-colors",
                    answers[currentQuestion.id] === opt ? "text-emerald-700" : "text-slate-600"
                  )}>
                    {opt}
                  </span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    answers[currentQuestion.id] === opt 
                      ? "bg-emerald-500 border-emerald-500 scale-110" 
                      : "border-slate-200"
                  )}>
                    {answers[currentQuestion.id] === opt && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <button 
          onClick={() => step > 0 && setStep(step - 1)}
          className={cn(
            "flex items-center gap-2 text-[13px] font-bold text-slate-400 transition-all",
            step === 0 ? "opacity-0 pointer-events-none" : "hover:text-slate-600"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Înapoi
        </button>
        
        <div className="flex items-center gap-1">
          {config.questions.map((_: any, i: number) => (
            <div 
              key={i} 
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-4 bg-emerald-500" : "bg-slate-200"
              )} 
            />
          ))}
        </div>

        <div className="w-20" /> {/* Spacer */}
      </div>
    </div>
  );
}
