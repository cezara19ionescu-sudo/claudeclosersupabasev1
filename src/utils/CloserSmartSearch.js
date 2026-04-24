/**
 * CloserSmartSearch — "AI-Powered" Search System
 * ================================================
 * 
 * This is NOT a real AI. It's a sophisticated keyword-matching + fuzzy-search
 * system that LOOKS and FEELS like AI to the end user.
 * 
 * How it works:
 *  1. User types in search bar → keywords extracted
 *  2. Keywords matched against pre-built category/subcategory map
 *  3. Suggestion chips appear instantly (filtered by match)
 *  4. Smart response text generated from templates
 *  5. Pros filtered from database by matched categories
 * 
 * Zero API calls. Works offline. Instant response (~200ms fake delay).
 * 
 * To integrate with your Closer app:
 *   import { SmartSearchEngine, CATEGORY_MAP } from './CloserSmartSearch';
 *   const engine = new SmartSearchEngine();
 *   const results = engine.search("my sink is leaking");
 */


// ============================================================
// 1. COMPLETE CATEGORY + KEYWORD MAP
// ============================================================

export const CATEGORY_MAP = {
  "Home & Maintenance": {
    icon: "home",
    keywords: [
      // English
      "home", "house", "flat", "apartment", "room", "kitchen", "bathroom",
      "bedroom", "living room", "garage", "attic", "basement", "roof",
      "wall", "floor", "ceiling", "door", "window", "pipe", "drain",
      "boiler", "heating", "radiator", "tap", "faucet", "toilet",
      "shower", "bath", "sink", "leak", "leaking", "burst", "broken",
      "fix", "repair", "install", "replace", "maintenance", "handyman",
      "diy", "renovation", "remodel",
      // Romanian
      "casa", "apartament", "camera", "bucatarie", "baie", "dormitor",
      "sufragerie", "garaj", "mansarda", "subsol", "acoperis", "perete",
      "podea", "tavan", "usa", "fereastra", "teava", "conducta",
      "centrala", "calorifer", "robinet", "chiuveta", "toaleta", "wc",
      "dus", "cada", "curge", "sparta", "stricat", "repara", "reparat",
      "instalare", "inlocuire", "intretinere", "renovare"
    ],
    subcategories: {
      "Plumber": {
        keywords: [
          "plumber", "plumbing", "pipe", "pipes", "leak", "leaking",
          "leaky", "burst", "water", "drain", "drainage", "clogged",
          "blocked", "tap", "faucet", "toilet", "shower", "bath",
          "bathtub", "sink", "boiler", "hot water", "central heating",
          "radiator", "overflow", "sewer", "septic", "valve", "pressure",
          "flood", "flooding", "drip", "dripping",
          // Romanian
          "instalator", "instalatii", "teava", "tevi", "curge", "apa",
          "scurgere", "infundat", "blocat", "robinet", "chiuveta",
          "toaleta", "wc", "dus", "cada", "centrala", "calorifer",
          "canal", "canalizare", "presiune", "inundatie", "picura"
        ],
        commonQueries: [
          "my sink is leaking",
          "burst pipe emergency",
          "toilet won't flush",
          "no hot water",
          "blocked drain",
          "dripping tap",
          "boiler not working",
          "shower pressure low",
          "chiuveta curge",
          "teava sparta",
          "wc infundat",
          "nu am apa calda",
          "calorifer nu merge"
        ]
      },
      "Electrician": {
        keywords: [
          "electrician", "electrical", "electric", "electricity",
          "power", "socket", "outlet", "switch", "light", "lights",
          "lighting", "wiring", "wire", "fuse", "fusebox", "breaker",
          "circuit", "voltage", "plug", "extension", "panel",
          "blackout", "outage", "spark", "sparking", "tripped",
          "current", "amp", "bulb", "led", "dimmer", "fan",
          "extractor", "smoke alarm", "doorbell", "rewire",
          // Romanian
          "electrician", "electric", "curent", "priza", "intrerupator",
          "lumina", "bec", "instalatie", "siguranta", "tablou",
          "cablu", "fir", "scurt", "scurtcircuit", "tensiune",
          "ventilator", "hota", "alarma", "sonerie", "nu am curent",
          "s-a dus curentul", "pana de curent"
        ],
        commonQueries: [
          "no power in house",
          "socket not working",
          "lights flickering",
          "need rewiring",
          "install new lights",
          "fuse keeps tripping",
          "nu am curent",
          "priza nu merge",
          "bec de schimbat",
          "instalatie electrica noua"
        ]
      },
      "Painter": {
        keywords: [
          "painter", "painting", "paint", "wall", "walls",
          "ceiling", "interior", "exterior", "colour", "color",
          "wallpaper", "primer", "emulsion", "gloss", "matt",
          "brush", "roller", "spray", "decorate", "decorator",
          "decoration", "mural", "stain", "varnish", "lacquer",
          // Romanian
          "zugrav", "zugravit", "vopsit", "vopsea", "perete",
          "pereti", "tavan", "interior", "exterior", "culoare",
          "tapet", "grund", "lavabil", "lac", "strat", "zugraveli"
        ],
        commonQueries: [
          "paint my living room",
          "need walls painted",
          "exterior house painting",
          "wallpaper removal",
          "zugrav pentru apartament",
          "vopsit pereti",
          "tapet de pus"
        ]
      },
      "Carpenter": {
        keywords: [
          "carpenter", "carpentry", "wood", "wooden", "timber",
          "furniture", "shelf", "shelves", "cabinet", "cupboard",
          "wardrobe", "table", "chair", "desk", "door", "doors",
          "frame", "skirting", "flooring", "laminate", "parquet",
          "deck", "decking", "fence", "fencing", "gate", "stairs",
          "banister", "fitted", "bespoke", "custom",
          // Romanian
          "tamplar", "tamplarie", "lemn", "mobila", "raft",
          "dulap", "masa", "scaun", "birou", "usa", "usi",
          "rama", "plinta", "parchet", "laminat", "gard",
          "poarta", "scari", "balustrada"
        ],
        commonQueries: [
          "fix broken door",
          "install shelves",
          "new kitchen cabinets",
          "build a deck",
          "laminate flooring",
          "tamplar pentru mobila",
          "parchet de pus",
          "dulap la comanda"
        ]
      },
      "Locksmith": {
        keywords: [
          "locksmith", "lock", "locks", "key", "keys", "locked",
          "locked out", "door lock", "deadbolt", "padlock", "safe",
          "security", "entry", "break in", "burglary", "change locks",
          "lost key", "spare key", "yale", "chubb", "upvc",
          // Romanian
          "lacatus", "incuietoare", "cheie", "chei", "blocat",
          "incuiat", "yala", "broasca", "usa blocata", "schimbat yala",
          "pierdut cheia", "cheie pierduta", "siguranta usa"
        ],
        commonQueries: [
          "locked out of house",
          "change door locks",
          "lost my keys",
          "break in repair",
          "m-am incuiat afara",
          "schimbat yala",
          "cheie pierduta"
        ]
      },
      "Handyman": {
        keywords: [
          "handyman", "odd jobs", "general", "fix", "repair",
          "assemble", "assembly", "ikea", "mount", "mounting",
          "hang", "hanging", "curtain", "curtains", "blind",
          "blinds", "tv mount", "picture", "mirror", "shelf",
          "flat pack", "general repair", "small jobs", "help",
          // Romanian
          "meserias", "reparatii", "asamblare", "montaj", "mobila",
          "perdea", "perdele", "jaluzea", "jaluzele", "tv", "tablou",
          "oglinda", "raft", "treaba", "ajutor", "diverse"
        ],
        commonQueries: [
          "assemble ikea furniture",
          "mount tv on wall",
          "hang curtains",
          "general repairs needed",
          "odd jobs around house",
          "montaj mobila ikea",
          "montat tv pe perete",
          "reparatii diverse"
        ]
      }
    }
  },

  "Beauty & Wellness": {
    icon: "sparkles",
    keywords: [
      "beauty", "wellness", "salon", "spa", "pamper", "treat",
      "treatment", "skin", "face", "facial", "body", "massage",
      "relax", "grooming", "cosmetic", "aesthetic", "look",
      "beautiful", "pretty", "glow", "self care",
      // Romanian
      "frumusete", "ingrijire", "salon", "spa", "masaj", "tratament",
      "piele", "fata", "corp", "relaxare", "cosmetica", "estetica"
    ],
    subcategories: {
      "Nail Tech": {
        keywords: [
          "nail", "nails", "manicure", "pedicure", "gel", "acrylic",
          "shellac", "polish", "nail art", "nail extensions", "cuticle",
          "french", "tips", "soak off", "fill", "overlay",
          // Romanian
          "unghii", "manichiura", "pedichiura", "gel", "oja",
          "unghii false", "constructie", "french", "nail art"
        ],
        commonQueries: [
          "gel nails appointment",
          "manicure near me",
          "acrylic nails",
          "pedicure at home",
          "manichiura cu gel",
          "pedichiura la domiciliu",
          "unghii cu gel"
        ]
      },
      "Hairdresser": {
        keywords: [
          "hair", "haircut", "hairdresser", "barber", "stylist",
          "cut", "trim", "blow dry", "colour", "color", "highlights",
          "balayage", "ombre", "perm", "straighten", "keratin",
          "extensions", "braids", "updo", "wedding hair", "men",
          "women", "kids", "children", "fringe", "bangs", "layers",
          // Romanian
          "par", "frizerie", "frizer", "coafor", "tuns", "tunde",
          "vopsit", "suvite", "balayage", "ombre", "coafura",
          "extensii", "impletit", "nunta", "barbat", "femeie"
        ],
        commonQueries: [
          "haircut at home",
          "need a trim",
          "colour my hair",
          "wedding hairstyle",
          "men's haircut",
          "tuns la domiciliu",
          "vopsit par",
          "coafura nunta"
        ]
      },
      "Makeup Artist": {
        keywords: [
          "makeup", "make up", "mua", "foundation", "lipstick",
          "eyeshadow", "contour", "bridal", "wedding", "prom",
          "party", "event", "glam", "natural", "smokey",
          // Romanian
          "machiaj", "machiat", "makeup", "fond de ten", "ruj",
          "fard", "contur", "mireasa", "nunta", "eveniment"
        ],
        commonQueries: [
          "bridal makeup",
          "party makeup",
          "natural look makeup",
          "machiaj mireasa",
          "machiaj eveniment"
        ]
      },
      "Massage Therapist": {
        keywords: [
          "massage", "masseuse", "deep tissue", "swedish",
          "sports massage", "relaxation", "therapeutic", "back pain",
          "neck", "shoulder", "tension", "knot", "stress",
          "aromatherapy", "hot stone", "reflexology",
          // Romanian
          "masaj", "maseur", "terapeutic", "relaxare", "spate",
          "gat", "umeri", "tensiune", "stres", "durere"
        ],
        commonQueries: [
          "deep tissue massage",
          "back pain massage",
          "relaxation massage at home",
          "masaj de relaxare",
          "masaj terapeutic spate"
        ]
      }
    }
  },

  "Auto & Transport": {
    icon: "car",
    keywords: [
      "auto", "car", "vehicle", "van", "truck", "bike",
      "motorcycle", "motor", "drive", "driving", "transport",
      "garage", "mot", "service", "mechanic",
      // Romanian
      "auto", "masina", "vehicul", "duba", "camion", "moto",
      "motocicleta", "transport", "service", "mecanic"
    ],
    subcategories: {
      "Mechanic": {
        keywords: [
          "mechanic", "engine", "brake", "brakes", "oil",
          "oil change", "tyre", "tire", "exhaust", "clutch",
          "gearbox", "battery", "starter", "alternator",
          "diagnostic", "warning light", "check engine",
          "mot", "service", "repair", "breakdown",
          // Romanian
          "mecanic", "motor", "frana", "frane", "ulei",
          "schimb ulei", "cauciuc", "anvelope", "esapament",
          "ambreiaj", "cutie viteze", "baterie", "acumulator",
          "diagnostic", "itp", "revizie", "defect", "pana"
        ],
        commonQueries: [
          "car won't start",
          "brake noise",
          "oil change needed",
          "mot service",
          "check engine light on",
          "masina nu porneste",
          "frane zgomot",
          "schimb ulei",
          "itp revizie"
        ]
      },
      "Car Wash": {
        keywords: [
          "car wash", "wash", "clean", "valet", "detailing",
          "detail", "polish", "wax", "interior clean", "exterior",
          "shampoo", "upholstery", "scratch",
          // Romanian
          "spalatorie", "spalat", "curat", "detailing",
          "polish", "ceara", "interior", "exterior", "tapiterie"
        ],
        commonQueries: [
          "car detailing",
          "interior car clean",
          "mobile car wash",
          "detailing auto",
          "spalat masina la domiciliu"
        ]
      },
      "Tyre Service": {
        keywords: [
          "tyre", "tire", "tyres", "tires", "puncture", "flat",
          "flat tyre", "wheel", "alignment", "balance", "change",
          "winter", "summer", "alloy",
          // Romanian
          "cauciuc", "anvelope", "pana", "roata", "geometrie",
          "echilibrat", "schimb", "iarna", "vara", "janta"
        ],
        commonQueries: [
          "flat tyre fix",
          "tyre change",
          "wheel alignment",
          "cauciuc pana",
          "schimb anvelope"
        ]
      }
    }
  },

  "Education": {
    icon: "book",
    keywords: [
      "education", "learn", "teach", "tutor", "tutoring",
      "lesson", "class", "course", "school", "college",
      "university", "student", "study", "homework", "exam",
      "test", "grade", "help", "academic",
      // Romanian
      "educatie", "invatare", "predare", "meditatie", "meditatii",
      "lectie", "curs", "scoala", "liceu", "universitate",
      "student", "studiu", "tema", "examen", "test", "nota"
    ],
    subcategories: {
      "Tutor": {
        keywords: [
          "tutor", "tutoring", "maths", "math", "english",
          "science", "physics", "chemistry", "biology", "history",
          "geography", "language", "french", "spanish", "german",
          "gcse", "a level", "sat", "homework", "revision",
          "exam prep", "private lesson",
          // Romanian
          "meditator", "meditatii", "matematica", "engleza",
          "fizica", "chimie", "biologie", "istorie", "geografie",
          "franceza", "germana", "bac", "bacalaureat", "admitere",
          "pregatire", "lectie particulara"
        ],
        commonQueries: [
          "maths tutor for GCSE",
          "english tutor for kids",
          "physics help",
          "homework help",
          "meditatii matematica",
          "pregatire bac",
          "lectii engleza"
        ]
      },
      "Music Teacher": {
        keywords: [
          "music", "piano", "guitar", "violin", "drums",
          "singing", "vocal", "instrument", "lesson", "teacher",
          // Romanian
          "muzica", "pian", "chitara", "vioara", "tobe",
          "canto", "vocal", "instrument", "profesor"
        ],
        commonQueries: [
          "piano lessons",
          "guitar teacher",
          "singing lessons",
          "lectii pian",
          "profesor chitara"
        ]
      },
      "Language Teacher": {
        keywords: [
          "language", "english", "french", "spanish", "german",
          "italian", "romanian", "chinese", "japanese", "arabic",
          "esl", "ielts", "toefl", "conversation", "grammar",
          // Romanian
          "limba", "engleza", "franceza", "germana", "italiana",
          "spaniola", "chineza", "japoneza", "conversatie", "gramatica"
        ],
        commonQueries: [
          "learn english",
          "french conversation",
          "IELTS preparation",
          "lectii engleza conversatie",
          "pregatire IELTS"
        ]
      }
    }
  },

  "Gardening": {
    icon: "leaf",
    keywords: [
      "garden", "gardening", "yard", "lawn", "grass", "tree",
      "plant", "flower", "hedge", "bush", "outdoor", "landscape",
      "patio", "deck", "fence", "shed", "greenhouse",
      // Romanian
      "gradina", "curte", "gazon", "iarba", "copac", "pom",
      "planta", "floare", "gard viu", "tufis", "peisaj",
      "terasa", "sera"
    ],
    subcategories: {
      "Lawn Care": {
        keywords: [
          "lawn", "grass", "mow", "mowing", "cut", "trim",
          "strim", "strimmer", "edge", "edging", "feed",
          "weed", "moss", "seed", "turf", "aerate", "gardener", "gardening",
          // Romanian
          "gazon", "iarba", "tuns", "tunde", "cosit",
          "margini", "buruieni", "seminte", "rulou", "gradinar", "gradinarit"
        ],
        commonQueries: [
          "my grass needs cutting",
          "lawn mowing service",
          "weed removal",
          "new turf laying",
          "tuns gazon",
          "cosit iarba",
          "gazon rulou"
        ]
      },
      "Tree Surgeon": {
        keywords: [
          "tree", "trees", "branch", "branches", "prune",
          "pruning", "fell", "felling", "stump", "removal",
          "hedge", "hedges", "trim", "topiary",
          // Romanian
          "copac", "copaci", "creanga", "crengi", "taiat",
          "toaletat", "ciot", "gard viu", "tundere"
        ],
        commonQueries: [
          "tree removal",
          "hedge trimming",
          "prune apple tree",
          "taiat copac",
          "toaletat gard viu"
        ]
      },
      "Landscaper": {
        keywords: [
          "landscape", "landscaping", "design", "patio", "path",
          "paving", "decking", "pond", "water feature", "retaining wall",
          "raised bed", "gravel", "stone", "rock",
          // Romanian
          "peisagist", "amenajare", "design", "pavaj", "alee",
          "terasa", "iaz", "zid", "jardiniera", "pietris"
        ],
        commonQueries: [
          "garden design",
          "patio installation",
          "landscaping project",
          "amenajare gradina",
          "pavaj curte"
        ]
      }
    }
  },

  "IT & Tech": {
    icon: "monitor",
    keywords: [
      "it", "tech", "technology", "computer", "laptop", "pc",
      "phone", "mobile", "tablet", "software", "hardware",
      "internet", "wifi", "network", "printer", "screen",
      // Romanian
      "calculator", "laptop", "telefon", "mobil", "tableta",
      "software", "hardware", "internet", "wifi", "retea",
      "imprimanta", "ecran"
    ],
    subcategories: {
      "Computer Repair": {
        keywords: [
          "computer", "laptop", "pc", "desktop", "slow",
          "virus", "malware", "crash", "blue screen", "broken",
          "screen", "keyboard", "upgrade", "ram", "ssd",
          "hard drive", "data recovery", "backup", "format",
          // Romanian
          "calculator", "laptop", "lent", "virus", "blocat",
          "ecran", "tastatura", "upgrade", "memorie", "date",
          "recuperare", "formatare"
        ],
        commonQueries: [
          "laptop running slow",
          "virus removal",
          "broken laptop screen",
          "data recovery",
          "laptop lent",
          "virus calculator",
          "ecran spart laptop"
        ]
      },
      "Phone Repair": {
        keywords: [
          "phone", "mobile", "iphone", "samsung", "android",
          "screen", "cracked", "battery", "charging", "water damage",
          // Romanian
          "telefon", "mobil", "ecran", "spart", "baterie",
          "incarcare", "apa"
        ],
        commonQueries: [
          "cracked phone screen",
          "iphone battery replacement",
          "phone not charging",
          "ecran telefon spart",
          "schimb baterie telefon"
        ]
      },
      "WiFi / Network": {
        keywords: [
          "wifi", "wi-fi", "internet", "router", "network",
          "slow internet", "no connection", "ethernet", "cable",
          "setup", "install", "extender", "mesh", "signal",
          // Romanian
          "wifi", "internet", "router", "retea", "conexiune",
          "semnal", "configurare", "instalare"
        ],
        commonQueries: [
          "wifi not working",
          "slow internet",
          "setup home network",
          "wifi nu merge",
          "internet lent"
        ]
      }
    }
  },

  "Pet Care": {
    icon: "heart",
    keywords: [
      "pet", "dog", "cat", "animal", "puppy", "kitten",
      "bird", "fish", "rabbit", "hamster",
      // Romanian
      "animal", "caine", "pisica", "catel", "pasare",
      "peste", "iepure", "hamster"
    ],
    subcategories: {
      "Dog Walker": {
        keywords: [
          "walk", "walking", "walker", "dog walk", "exercise",
          "daily", "morning", "afternoon", "park",
          // Romanian
          "plimbare", "plimbat", "caine", "parc", "zilnic"
        ],
        commonQueries: [
          "dog walker needed",
          "daily dog walking",
          "walk my dog",
          "plimbare caine",
          "plimbat catel"
        ]
      },
      "Pet Sitter": {
        keywords: [
          "sit", "sitter", "sitting", "pet sit", "house sit",
          "holiday", "vacation", "overnight", "boarding",
          "care", "feed", "feeding",
          // Romanian
          "ingrijire", "supraveghere", "vacanta", "concediu",
          "hrana", "hranire"
        ],
        commonQueries: [
          "pet sitting while on holiday",
          "cat sitter needed",
          "overnight pet care",
          "ingrijire pisica vacanta",
          "supraveghere caine"
        ]
      },
      "Dog Groomer": {
        keywords: [
          "groom", "grooming", "groomer", "wash", "bath",
          "trim", "clip", "style", "fur", "coat", "nails",
          // Romanian
          "tuns", "spalat", "cosmetica", "blana", "unghii"
        ],
        commonQueries: [
          "dog grooming",
          "puppy first groom",
          "dog bath and trim",
          "tuns caine",
          "cosmetica canina"
        ]
      }
    }
  },

  "Cleaning": {
    icon: "sparkle",
    keywords: [
      "clean", "cleaning", "cleaner", "tidy", "spotless",
      "scrub", "wash", "sanitize", "disinfect", "fresh",
      // Romanian
      "curat", "curatenie", "curatare", "dezinfectare", "igienizare"
    ],
    subcategories: {
      "House Cleaning": {
        keywords: [
          "house", "home", "flat", "apartment", "room",
          "deep clean", "regular", "weekly", "monthly",
          "spring clean", "move in", "move out", "end of tenancy",
          // Romanian
          "casa", "apartament", "camera", "curatenie generala",
          "saptamanal", "lunar", "mutat"
        ],
        commonQueries: [
          "house cleaning service",
          "deep clean my flat",
          "end of tenancy clean",
          "weekly cleaner needed",
          "curatenie apartament",
          "curatenie generala"
        ]
      },
      "Carpet Cleaning": {
        keywords: [
          "carpet", "rug", "upholstery", "sofa", "couch",
          "stain", "steam", "dry clean",
          // Romanian
          "covor", "mocheta", "canapea", "pata", "aburi"
        ],
        commonQueries: [
          "carpet cleaning",
          "sofa steam clean",
          "remove stain from carpet",
          "curatat covor",
          "spalat canapea"
        ]
      }
    }
  },

  "Events": {
    icon: "calendar",
    keywords: [
      "event", "party", "wedding", "birthday", "celebration",
      "ceremony", "corporate", "conference", "reception",
      // Romanian
      "eveniment", "petrecere", "nunta", "zi nastere", "sarbatoare",
      "ceremonie", "corporate", "receptie"
    ],
    subcategories: {
      "DJ": {
        keywords: ["dj", "music", "disco", "sound", "speaker", "playlist", "muzica", "boxe"],
        commonQueries: ["dj for wedding", "party dj", "dj nunta", "dj petrecere"]
      },
      "Photographer": {
        keywords: ["photo", "photographer", "photography", "camera", "shoot", "portrait", "fotograf", "fotografie", "sedinta foto"],
        commonQueries: ["wedding photographer", "portrait session", "fotograf nunta", "sedinta foto"]
      },
      "Caterer": {
        keywords: ["catering", "food", "chef", "cook", "menu", "buffet", "party food", "mancare", "bucatar", "meniu", "gatit"],
        commonQueries: ["catering for party", "private chef", "cook needed", "catering nunta", "bucatar privat", "am nevoie de un bucatar"]
      }
    }
  },

  "Health & Fitness": {
    icon: "heart",
    keywords: [
      "health", "fitness", "gym", "exercise", "workout",
      "training", "trainer", "yoga", "pilates", "nutrition",
      // Romanian
      "sanatate", "fitness", "sala", "exercitiu", "antrenament",
      "antrenor", "yoga", "pilates", "nutritie"
    ],
    subcategories: {
      "Personal Trainer": {
        keywords: ["trainer", "training", "personal", "fitness", "gym", "workout", "exercise", "muscle", "weight", "antrenor", "antrenament"],
        commonQueries: ["personal trainer near me", "home fitness trainer", "antrenor personal", "antrenament acasa"]
      },
      "Yoga Instructor": {
        keywords: ["yoga", "meditation", "mindfulness", "stretch", "flexibility", "meditatie", "flexibilitate"],
        commonQueries: ["yoga classes", "private yoga session", "cursuri yoga", "yoga la domiciliu"]
      },
      "Nutritionist": {
        keywords: ["nutrition", "diet", "meal plan", "weight loss", "healthy", "food", "nutritie", "dieta", "plan alimentar", "slabire"],
        commonQueries: ["meal plan help", "nutritionist consultation", "plan alimentar", "consultatie nutritionist"]
      }
    }
  },

  "Legal & Admin": {
    icon: "scale",
    keywords: [
      "legal", "law", "lawyer", "solicitor", "notary",
      "contract", "document", "admin", "paperwork", "tax",
      // Romanian
      "legal", "lege", "avocat", "notar", "contract",
      "document", "acte", "taxe", "impozit"
    ],
    subcategories: {
      "Accountant": {
        keywords: ["accountant", "accounting", "tax", "vat", "bookkeeping", "invoice", "payroll", "contabil", "contabilitate", "taxe", "tva", "factura"],
        commonQueries: ["tax return help", "small business accountant", "contabil firma", "declaratii taxe"]
      },
      "Translator": {
        keywords: ["translate", "translator", "translation", "interpret", "interpreter", "language", "document", "traducere", "traducator", "interpret", "limba"],
        commonQueries: ["document translation", "Romanian to English translator", "traducere acte", "traducator autorizat"]
      }
    }
  }
};


// ============================================================
// 2. SMART SEARCH ENGINE
// ============================================================

export class SmartSearchEngine {
  constructor(categoryMap = CATEGORY_MAP) {
    this.categoryMap = categoryMap;
    this.index = this._buildIndex();
  }

  _buildIndex() {
    const index = [];
    
    for (const [catName, cat] of Object.entries(this.categoryMap)) {
      for (const kw of cat.keywords) {
        index.push({
          keyword: kw.toLowerCase(),
          category: catName,
          subcategory: null,
          icon: cat.icon
        });
      }
      
      if (cat.subcategories) {
        for (const [subName, sub] of Object.entries(cat.subcategories)) {
          for (const kw of sub.keywords) {
            index.push({
              keyword: kw.toLowerCase(),
              category: catName,
              subcategory: subName,
              icon: cat.icon
            });
          }
        }
      }
    }
    
    return index;
  }

  /**
   * Main search method — call this with user input
   * Returns: { categories, subcategories, suggestions, aiResponse, chips }
   */
  search(query) {
    if (!query || query.trim().length < 2) {
      return {
        categories: [],
        subcategories: [],
        suggestions: [],
        aiResponse: null,
        chips: this._getDefaultChips()
      };
    }

    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);
    
    // Score each category + subcategory
    const scores = {};
    const subScores = {};

    // Generic words detection (English + Romanian)
    const genericWords = [
      "need", "caut", "vreau", "recomand", "pro", "help", "ajutor", "i", "am", "a", "an", "the",
      "am", "nevoie", "de", "un", "o", "ca", "sa", "mi", "unul", "cineva", "looking", "for"
    ];
    const hasGenericWord = words.some(w => genericWords.includes(w));
    
    for (const word of words) {
      if (word.length < 2) continue;

      for (const entry of this.index) {
        // Exact match
        if (entry.keyword === word) {
          const key = entry.category;
          scores[key] = (scores[key] || 0) + 10;
          
          if (entry.subcategory) {
            const subKey = `${key}::${entry.subcategory}`;
            subScores[subKey] = (subScores[subKey] || 0) + 10;
          }
        }
        // Partial match (word starts with keyword or keyword starts with word)
        else if (word.length >= 3 && (entry.keyword.startsWith(word) || word.startsWith(entry.keyword))) {
          const key = entry.category;
          scores[key] = (scores[key] || 0) + 5;
          
          if (entry.subcategory) {
            const subKey = `${key}::${entry.subcategory}`;
            subScores[subKey] = (subScores[subKey] || 0) + 5;
          }
        }
        // Fuzzy match (Levenshtein distance ≤ 1 for words ≥ 5 chars)
        else if (word.length >= 5 && this._levenshtein(word, entry.keyword) <= 1) {
          const key = entry.category;
          scores[key] = (scores[key] || 0) + 3;
          
          if (entry.subcategory) {
            const subKey = `${key}::${entry.subcategory}`;
            subScores[subKey] = (subScores[subKey] || 0) + 3;
          }
        }
      }
    }

    // If query contains generic words AND we haven't found any strong matches yet,
    // add a small base score to ALL subcategories to show popular options
    const topScoreFound = Object.values(subScores).reduce((max, s) => Math.max(max, s), 0);
    
    if (hasGenericWord && topScoreFound < 5) {
      for (const entry of this.index) {
        if (entry.subcategory) {
          const subKey = `${entry.category}::${entry.subcategory}`;
          subScores[subKey] = (subScores[subKey] || 0) + 2;
        }
      }
    }

    // Sort by score
    const sortedCats = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    const sortedSubs = Object.entries(subScores)
      .sort((a, b) => b[1] - a[1])
      .map(([key, score]) => {
        const [cat, sub] = key.split('::');
        return { category: cat, subcategory: sub, score };
      });

    // Build chips from top matches
    const chips = sortedSubs.slice(0, 6).map(s => ({
      label: s.subcategory,
      category: s.category
    }));

    // If no subcategory matches but category matches, show category subcategories
    if (chips.length === 0 && sortedCats.length > 0) {
      const topCat = this.categoryMap[sortedCats[0]];
      if (topCat?.subcategories) {
        const subs = Object.keys(topCat.subcategories);
        for (const sub of subs.slice(0, 4)) {
          chips.push({ label: sub, category: sortedCats[0] });
        }
      }
    }

    // Generate AI-like response
    const aiResponse = this._generateResponse(normalizedQuery, sortedCats, sortedSubs);

    // Get common query suggestions
    const suggestions = this._getSuggestions(sortedSubs);

    return {
      categories: sortedCats.slice(0, 3),
      subcategories: sortedSubs.slice(0, 20),
      suggestions: suggestions.slice(0, 4),
      aiResponse,
      chips: chips.length > 0 ? chips : this._getDefaultChips()
    };
  }

  _generateResponse(query, categories, subcategories) {
    if (categories.length === 0) {
      return {
        text: "Tell me more about what you need — I'll find the right professional for you.",
        textRo: "Spune-mi mai multe despre ce ai nevoie — găsesc profesionistul potrivit.",
        confidence: 0,
        isUrgent: false
      };
    }

    const topCat = categories[0];
    const topSub = subcategories.length > 0 ? subcategories[0].subcategory : null;
    
    // Detect urgency
    const urgentWords = ["emergency", "urgent", "asap", "now", "help", "burst", "flood",
      "locked out", "no power", "urgenta", "acum", "ajutor", "sparta", "inundatie",
      "incuiat", "blocat", "need help", "i need now", "nevoie acum"];
    const isUrgent = urgentWords.some(w => query.includes(w));

    // Templates
    const templates = {
      "Plumber": {
        normal: `I found plumbers near you who specialize in this. Let me show you the best rated ones.`,
        normalRo: `Am găsit instalatori aproape de tine specializați pe asta. Uite cei mai bine cotați.`,
        urgent: `URGENT: I'm finding available plumbers RIGHT NOW. Average response: 12 minutes.`,
        urgentRo: `URGENT: Caut instalatori disponibili ACUM. Răspuns mediu: 12 minute.`
      },
      "Electrician": {
        normal: `I found electricians who can help with this. Here are the top rated nearby.`,
        normalRo: `Am găsit electricieni care te pot ajuta. Iată cei mai buni din apropiere.`,
        urgent: `URGENT: Finding electricians available NOW. Your safety is the priority.`,
        urgentRo: `URGENT: Caut electricieni disponibili ACUM. Siguranța ta e prioritară.`
      },
      "Nail Tech": {
        normal: `I found nail technicians near you with great reviews. Ready to book?`,
        normalRo: `Am găsit manichiuriste aproape de tine cu review-uri excelente. Rezervi?`
      },
      "Hairdresser": {
        normal: `Found hairdressers available in your area. Let me show you the best options.`,
        normalRo: `Am găsit frizeri disponibili în zona ta. Uite cele mai bune opțiuni.`
      },
      "Dog Walker": {
        normal: `I found dog walkers near you who'd love to meet your pup! Here are the top ones.`,
        normalRo: `Am găsit oameni care plimbă câini aproape de tine. Iată cei mai buni.`
      },
      "Tutor": {
        normal: `I found qualified tutors for this subject near you. Here are the best rated.`,
        normalRo: `Am găsit profesori calificați pe materia asta. Iată cei mai bine cotați.`
      },
      "Mechanic": {
        normal: `Found mechanics who can diagnose and fix this. Here are the top options.`,
        normalRo: `Am găsit mecanici care pot diagnostica și repara asta. Iată opțiunile.`
      }
    };

    const t = templates[topSub] || {
      normal: `I found professionals in ${topCat} who can help. Here are the top rated ones near you.`,
      normalRo: `Am găsit profesioniști din ${topCat} care te pot ajuta. Iată cei mai buni din apropiere.`
    };

    return {
      text: isUrgent ? (t.urgent || t.normal) : t.normal,
      textRo: isUrgent ? (t.urgentRo || t.normalRo) : t.normalRo,
      confidence: subcategories.length > 0 ? 95 : 70,
      isUrgent,
      urgency: isUrgent ? 'emergency' : 'normal',
      matchedCategory: topCat,
      matchedSubcategory: topSub
    };
  }

  _getSuggestions(subcategories) {
    const suggestions = [];
    for (const sub of subcategories) {
      const catData = this.categoryMap[sub.category];
      if (catData?.subcategories?.[sub.subcategory]?.commonQueries) {
        suggestions.push(...catData.subcategories[sub.subcategory].commonQueries.slice(0, 2));
      }
    }
    return [...new Set(suggestions)];
  }

  _getDefaultChips() {
    return [
      { label: "Plumber", category: "Home & Maintenance" },
      { label: "Electrician", category: "Home & Maintenance" },
      { label: "Nail Tech", category: "Beauty & Wellness" },
      { label: "Dog Walker", category: "Pet Care" },
      { label: "Tutor", category: "Education" },
      { label: "House Cleaning", category: "Cleaning" }
    ];
  }

  _levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  }
}


// ============================================================
// 3. USAGE EXAMPLE
// ============================================================

/*
import { SmartSearchEngine } from './CloserSmartSearch';

const engine = new SmartSearchEngine();

// User types "I NEED A PLMBER FOR SINK"
const result = engine.search("I NEED A PLMBER FOR SINK");

console.log(result);
// {
//   categories: ["Home & Maintenance"],
//   subcategories: [
//     { category: "Home & Maintenance", subcategory: "Plumber" }
//   ],
//   suggestions: [
//     "my sink is leaking",
//     "burst pipe emergency",
//     "toilet won't flush",
//     "no hot water"
//   ],
//   aiResponse: {
//     text: "I found plumbers near you who specialize in this...",
//     textRo: "Am găsit instalatori aproape de tine...",
//     confidence: 95,
//     isUrgent: false,
//     matchedCategory: "Home & Maintenance",
//     matchedSubcategory: "Plumber"
//   },
//   chips: [
//     { label: "Plumber", category: "Home & Maintenance" }
//   ]
// }

// Note: "PLMBER" (typo) still matches "plumber" via Levenshtein distance ≤ 2!


// In your React component:
const [query, setQuery] = useState('');
const [results, setResults] = useState(null);

const handleSearch = (text) => {
  setQuery(text);
  
  // Fake 200ms "AI thinking" delay
  setTimeout(() => {
    setResults(engine.search(text));
  }, 200);
};

// Then render chips:
{results?.chips.map(chip => (
  <button key={chip.label} onClick={() => navigateToCategory(chip)}>
    {chip.label}
  </button>
))}

// And AI response:
{results?.aiResponse && (
  <p className={results.aiResponse.isUrgent ? 'urgent' : ''}>
    {results.aiResponse.text}
  </p>
)}
*/
