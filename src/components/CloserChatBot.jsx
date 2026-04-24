import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, ArrowRight, ChevronDown } from 'lucide-react';

/**
 * CloserChatBot — Complete Self-Contained Chat System
 * ===================================================
 * 
 * NO API KEY NEEDED. Zero external calls. 100% local.
 * 
 * How it works:
 *  1. User types a message or taps a quick reply
 *  2. Intent detection (keyword matching) identifies what they want
 *  3. Pre-written response is selected from knowledge base
 *  4. Follow-up suggestions appear as quick reply chips
 *  5. Conversation flows naturally through multi-turn paths
 * 
 * Covers:
 *  - How Closer works (step by step)
 *  - Pricing & fees
 *  - Pro verification process
 *  - How to book / cancel / reschedule
 *  - Emergency "Help Now" feature
 *  - Becoming a professional
 *  - Account & payment questions
 *  - Cities & availability
 *  - Trust & safety / guarantees
 *  - Contact support
 *  - Bilingual RO + EN
 * 
 * Usage:
 *   import CloserChatBot from './CloserChatBot';
 *   // Place at the bottom of your App layout:
 *   <CloserChatBot />
 */


// ============================================================
// 1. KNOWLEDGE BASE — Everything the bot knows
// ============================================================

const KNOWLEDGE_BASE = {

  // ---------- HOW IT WORKS ----------
  how_it_works: {
    keywords: ['how', 'work', 'works', 'use', 'using', 'what is', 'explain', 'about', 'cum', 'functioneaza', 'funcționează', 'ce este', 'despre'],
    response: {
      en: "Closer connects you with verified local professionals in 3 simple steps:\n\n**1. Describe your need** — Type naturally in the search bar (e.g. \"my sink is leaking\") or tap a category.\n\n**2. AI finds the best pros** — We instantly match you with verified professionals near you, sorted by rating, price, and availability.\n\n**3. Book & get it done** — Chat with the pro, agree on price, and pay securely through the app. Leave a review when done!",
      ro: "Closer te conectează cu profesioniști locali verificați în 3 pași simpli:\n\n**1. Descrie ce ai nevoie** — Scrie natural în bara de căutare (ex: „chiuveta curge\") sau alege o categorie.\n\n**2. AI-ul găsește cei mai buni** — Te conectăm instant cu profesioniști verificați aproape de tine, sortați după rating, preț și disponibilitate.\n\n**3. Rezervi și gata** — Vorbești cu pro-ul, agreezi prețul, și plătești sigur prin app. Lași review la final!"
    },
    quickReplies: ['pricing', 'how_book', 'categories', 'become_pro']
  },

  // ---------- PRICING ----------
  pricing: {
    keywords: ['price', 'pricing', 'cost', 'costs', 'fee', 'fees', 'charge', 'charges', 'pay', 'payment', 'commission', 'free', 'money', 'pret', 'preț', 'costa', 'costă', 'gratuit', 'bani', 'comision', 'taxa', 'taxă', 'plata', 'plată'],
    response: {
      en: "**For clients:** Closer is completely FREE to use! You only pay the price agreed with the professional. No hidden fees.\n\n**Optional Priority Fee:** For urgent requests (\"I Need Help Now\"), there's a small fee of £10 (UK) or 25 RON (Romania) to fast-track your request.\n\n**For professionals:** First month is FREE (0% commission). After that, a small 8% commission on completed jobs. No upfront costs, no subscription.",
      ro: "**Pentru clienți:** Closer e complet GRATUIT! Plătești doar prețul agreat cu profesionistul. Fără taxe ascunse.\n\n**Fee opțional de prioritate:** Pentru urgențe („I Need Help Now\"), un fee mic de 25 RON (RO) sau £10 (UK) pentru a accelera cererea.\n\n**Pentru profesioniști:** Prima lună e GRATUITĂ (0% comision). După aceea, 8% comision pe job-uri finalizate. Fără costuri inițiale, fără abonament."
    },
    quickReplies: ['how_it_works', 'become_pro', 'guarantee', 'help_now']
  },

  // ---------- CATEGORIES ----------
  categories: {
    keywords: ['categories', 'category', 'services', 'service', 'types', 'what can', 'offer', 'categorii', 'categorie', 'servicii', 'serviciu', 'tipuri', 'ce pot', 'oferi'],
    response: {
      en: "We have **12 categories** with dozens of subcategories:\n\n🏠 **Home & Maintenance** — Plumber, Electrician, Painter, Carpenter, Locksmith, Handyman\n💅 **Beauty & Wellness** — Nails, Hair, Makeup, Massage\n🚗 **Auto & Transport** — Mechanic, Car Wash, Tyres\n🎉 **Events** — DJ, Photographer, Catering\n📚 **Education** — Tutoring, Music, Languages\n💻 **IT & Tech** — Computer, Phone, WiFi\n🐾 **Pet Care** — Dog Walker, Pet Sitter, Grooming\n❤️ **Health & Fitness** — Personal Trainer, Yoga, Nutrition\n⚖️ **Legal & Admin** — Accountant, Translator\n🌿 **Gardening** — Lawn, Trees, Landscaping\n🧹 **Cleaning** — House, Carpet\n😊 **Lifestyle** — Various personal services",
      ro: "Avem **12 categorii** cu zeci de subcategorii:\n\n🏠 **Home & Maintenance** — Instalator, Electrician, Zugrav, Tâmplar, Lăcătuș\n💅 **Beauty & Wellness** — Manichiură, Coafor, Machiaj, Masaj\n🚗 **Auto & Transport** — Mecanic, Spălătorie, Anvelope\n🎉 **Events** — DJ, Fotograf, Catering\n📚 **Education** — Meditații, Muzică, Limbi\n💻 **IT & Tech** — Calculator, Telefon, WiFi\n🐾 **Pet Care** — Plimbare câini, Supraveghere, Cosmetică\n❤️ **Health & Fitness** — Antrenor, Yoga, Nutriție\n⚖️ **Legal & Admin** — Contabil, Traducător\n🌿 **Gardening** — Gazon, Copaci, Peisaj\n🧹 **Cleaning** — Casă, Covoare\n😊 **Lifestyle** — Diverse servicii personale"
    },
    quickReplies: ['how_book', 'pricing', 'cities']
  },

  // ---------- HOW TO BOOK ----------
  how_book: {
    keywords: ['book', 'booking', 'reserve', 'reservation', 'appointment', 'schedule', 'hire', 'find', 'get', 'rezerv', 'programare', 'programez', 'angajez', 'gasesc', 'găsesc'],
    response: {
      en: "Booking is super easy:\n\n1️⃣ **Search** — Type what you need or browse categories\n2️⃣ **Compare** — See verified pros with ratings, prices, and response times\n3️⃣ **Choose** — Pick the pro that fits your budget and timing\n4️⃣ **Chat** — Message them directly to discuss details\n5️⃣ **Confirm** — Agree on price and time, they come to you!\n\nThe whole process takes about 2-3 minutes. For emergencies, use \"I Need Help Now\" for an average 12-minute response!",
      ro: "Rezervarea e foarte simplă:\n\n1️⃣ **Caută** — Scrie ce ai nevoie sau navighează categoriile\n2️⃣ **Compară** — Vezi profesioniști verificați cu rating, prețuri, timp răspuns\n3️⃣ **Alege** — Alege pro-ul care se potrivește la buget și timp\n4️⃣ **Chat** — Trimite mesaj direct pentru detalii\n5️⃣ **Confirmă** — Agreezi prețul și ora, vin la tine!\n\nTot procesul durează 2-3 minute. Pentru urgențe, folosește „I Need Help Now\" — răspuns mediu 12 minute!"
    },
    quickReplies: ['pricing', 'cancel', 'help_now', 'guarantee']
  },

  // ---------- CANCEL / RESCHEDULE ----------
  cancel: {
    keywords: ['cancel', 'cancellation', 'reschedule', 'change', 'modify', 'refund', 'anulez', 'anulare', 'reprogramez', 'schimb', 'modific', 'ramburs'],
    response: {
      en: "**Cancellation policy:**\n\n✅ **2+ hours before** — Free cancellation, no charge\n⚠️ **Under 2 hours** — 20% cancellation fee\n🔴 **No-show** — Full charge applies\n\n**Rescheduling** is free and unlimited — just message the pro through the app to agree on a new time.\n\n**Refunds** are processed within 3-5 business days if applicable.",
      ro: "**Politica de anulare:**\n\n✅ **Cu 2+ ore înainte** — Anulare gratuită\n⚠️ **Sub 2 ore** — 20% taxa de anulare\n🔴 **Nu te prezinți** — Se percepe costul integral\n\n**Reprogramarea** e gratuită și nelimitată — trimite mesaj pro-ului prin app.\n\n**Rambursările** se procesează în 3-5 zile lucrătoare."
    },
    quickReplies: ['guarantee', 'contact_support', 'pricing']
  },

  // ---------- HELP NOW / EMERGENCY ----------
  help_now: {
    keywords: ['help now', 'emergency', 'urgent', 'asap', 'right now', 'immediately', 'help me', 'sos', 'urgenta', 'urgență', 'acum', 'imediat', 'ajutor'],
    response: {
      en: "**\"I Need Help Now\"** is our emergency feature for urgent situations:\n\n⚡ **How it works:** Tap the orange button → describe your emergency → we instantly notify ALL available pros near you\n\n⏱️ **Average response:** 11-15 minutes\n\n💰 **Priority Fee:** £10 (UK) / 25 RON (RO) — ensures your request gets immediate attention\n\n🔔 **What happens:** Up to 23 pros are notified simultaneously. The first one to accept gets the job.\n\n**Perfect for:** Burst pipes, power outages, locked out, broken boiler, etc.",
      ro: "**„I Need Help Now\"** e funcția noastră de urgență:\n\n⚡ **Cum funcționează:** Apeși butonul portocaliu → descrii urgența → notificăm TOȚI profesioniștii disponibili aproape de tine\n\n⏱️ **Răspuns mediu:** 11-15 minute\n\n💰 **Fee prioritate:** 25 RON (RO) / £10 (UK) — asigură atenție imediată\n\n🔔 **Ce se întâmplă:** Până la 23 de pros sunt notificați simultan. Primul care acceptă primește jobul.\n\n**Perfect pentru:** Țeavă spartă, pană de curent, ușă încuiată, centrală defectă, etc."
    },
    quickReplies: ['pricing', 'guarantee', 'how_book']
  },

  // ---------- BECOME A PRO ----------
  become_pro: {
    keywords: ['become', 'professional', 'pro', 'register', 'sign up', 'join', 'work', 'earn', 'money', 'meserias', 'meseriaș', 'profesionist', 'inregistr', 'înregistr', 'inscri', 'înscri', 'lucrez', 'castig', 'câștig'],
    response: {
      en: "**Become a Closer professional in 5 minutes!**\n\n📋 **What you need:**\n• Valid ID (passport or driving license)\n• DBS check (UK) / Criminal record (RO) — we help you get it\n• Phone with the Closer app\n\n💰 **How you earn:**\n• YOU set your own prices\n• First month: 0% commission (FREE)\n• After that: only 8% commission on completed jobs\n• Average earnings: £800-1,200/month (UK) or 3,200 RON/month (RO) with 15 jobs\n\n✅ **Benefits:** Flexible schedule, no upfront costs, verified client base, secure payments, support 24/7",
      ro: "**Devino profesionist Closer în 5 minute!**\n\n📋 **Ce ai nevoie:**\n• Act de identitate valid\n• Cazier judiciar curat — te ajutăm să-l obții\n• Telefon cu aplicația Closer\n\n💰 **Cum câștigi:**\n• TU setezi propriile prețuri\n• Prima lună: 0% comision (GRATUIT)\n• După aceea: doar 8% comision pe job-uri finalizate\n• Câștig mediu: 3,200 RON/lună cu 15 job-uri\n\n✅ **Beneficii:** Program flexibil, zero costuri inițiale, clienți verificați, plăți securizate, suport 24/7"
    },
    quickReplies: ['pricing', 'verification', 'cities', 'how_it_works']
  },

  // ---------- VERIFICATION ----------
  verification: {
    keywords: ['verif', 'verified', 'check', 'checked', 'trust', 'safe', 'safety', 'dbs', 'background', 'id', 'identity', 'cazier', 'verificat', 'sigur', 'siguranta', 'siguranță', 'identitate'],
    response: {
      en: "**Every Closer professional goes through a strict verification:**\n\n🪪 **ID Verification** — Government-issued ID checked and confirmed\n\n🔍 **Background Check:**\n• UK: DBS (Disclosure and Barring Service) check\n• Romania: Criminal record certificate (cazier judiciar)\n\n⭐ **Reviews** — Only verified clients who completed a job can leave reviews. No fake reviews.\n\n📞 **Reference Check** — Minimum 3 professional references validated by our team\n\n🛡️ **Insurance** — Public liability coverage up to €5,000 for damages\n\nEvery pro has visible badges: ✓ ID Checked ✓ DBS / Cazier",
      ro: "**Fiecare profesionist Closer trece printr-o verificare strictă:**\n\n🪪 **Verificare identitate** — Act de identitate verificat și confirmat\n\n🔍 **Verificare antecedente:**\n• România: Cazier judiciar curat\n• UK: DBS (Disclosure and Barring Service)\n\n⭐ **Review-uri** — Doar clienți verificați care au finalizat un job pot lăsa review. Zero review-uri false.\n\n📞 **Referințe** — Minim 3 referințe profesionale validate de echipa noastră\n\n🛡️ **Asigurare** — Acoperire până la 5.000€ pentru daune\n\nFiecare pro are badge-uri vizibile: ✓ CI Verificat ✓ Cazier"
    },
    quickReplies: ['guarantee', 'become_pro', 'how_book']
  },

  // ---------- GUARANTEE ----------
  guarantee: {
    keywords: ['guarantee', 'guaranteed', 'warranty', 'protect', 'protection', 'insur', 'insurance', 'damage', 'problem', 'complaint', 'issue', 'garantie', 'garanție', 'protectie', 'protecție', 'asigurare', 'dauna', 'daună', 'problema', 'problemă', 'reclamatie', 'reclamație'],
    response: {
      en: "**Closer Guarantee — You're fully protected:**\n\n🛡️ **30-day guarantee** — Not satisfied? Free redo or full refund\n\n💰 **Secure payments** — Money is held safely until the job is done and you confirm satisfaction\n\n🔒 **€5,000 insurance** — Coverage for accidental damage during the job\n\n📞 **24/7 support** — We respond within 15 minutes, any time\n\n**If something goes wrong:**\n1. Contact us through the app\n2. We review the situation within 24 hours\n3. We arrange a free fix or full refund\n\nYour satisfaction is guaranteed. Period.",
      ro: "**Garanția Closer — Ești complet protejat:**\n\n🛡️ **Garanție 30 zile** — Nu ești mulțumit? Refacere gratuită sau bani înapoi\n\n💰 **Plăți securizate** — Banii sunt ținuți în siguranță până la finalizarea lucrării\n\n🔒 **Asigurare €5,000** — Acoperire pentru daune accidentale\n\n📞 **Suport 24/7** — Răspundem în maxim 15 minute, oricând\n\n**Dacă ceva nu e ok:**\n1. Contactează-ne prin app\n2. Analizăm situația în 24 ore\n3. Aranjăm refacere gratuită sau ramburs\n\nSatisfacția ta e garantată. Punct."
    },
    quickReplies: ['cancel', 'contact_support', 'verification']
  },

  // ---------- CITIES ----------
  cities: {
    keywords: ['city', 'cities', 'location', 'where', 'available', 'area', 'areas', 'cover', 'coverage', 'country', 'oras', 'oraș', 'orașe', 'locatie', 'locație', 'unde', 'disponibil', 'acoperire', 'zona', 'zonă', 'tara', 'țară'],
    response: {
      en: "**Closer is currently active in:**\n\n🇬🇧 **UK:**\n• ✅ Northampton — LIVE\n• 🔜 Luton — Coming soon\n• 🔜 Milton Keynes — 2026\n• 🔜 Bedford — 2026\n• 🔜 Peterborough — 2026\n\n🇷🇴 **Romania:**\n• ✅ Ploiești — LIVE\n• 🔜 Brașov — Coming soon\n• 🔜 Cluj-Napoca — 2026\n• 🔜 Sibiu — 2026\n• 🔜 Pitești — 2026\n\nWe're expanding fast! If your city isn't listed yet, sign up and we'll notify you when we launch there.",
      ro: "**Closer e activ în prezent:**\n\n🇬🇧 **UK:**\n• ✅ Northampton — ACTIV\n• 🔜 Luton — În curând\n• 🔜 Milton Keynes — 2026\n\n🇷🇴 **România:**\n• ✅ Ploiești — ACTIV\n• 🔜 Brașov — În curând\n• 🔜 Cluj-Napoca — 2026\n• 🔜 Sibiu — 2026\n• 🔜 Pitești — 2026\n\nNe extindem rapid! Dacă orașul tău nu e încă listat, înscrie-te și te notificăm la lansare."
    },
    quickReplies: ['how_it_works', 'become_pro', 'categories']
  },

  // ---------- PAYMENT ----------
  payment: {
    keywords: ['payment', 'pay', 'card', 'cash', 'stripe', 'transfer', 'bank', 'invoice', 'receipt', 'plata', 'plată', 'platesc', 'plătesc', 'card', 'numerar', 'transfer', 'factura', 'factură', 'bon', 'chitanta', 'chitanță'],
    response: {
      en: "**Payment is simple and secure:**\n\n💳 **Accepted methods:**\n• Credit/debit card (Visa, Mastercard)\n• Apple Pay / Google Pay\n• Bank transfer (for larger jobs)\n\n🔒 **How it works:**\n1. You agree on a price with the pro\n2. Payment is held securely by Closer (escrow)\n3. Money is released to the pro ONLY after you confirm the job is done\n4. You get a digital receipt automatically\n\n**No cash needed.** Everything through the app for your protection.",
      ro: "**Plata e simplă și securizată:**\n\n💳 **Metode acceptate:**\n• Card credit/debit (Visa, Mastercard)\n• Apple Pay / Google Pay\n• Transfer bancar (pentru lucrări mari)\n\n🔒 **Cum funcționează:**\n1. Agreezi prețul cu profesionistul\n2. Plata e ținută în siguranță de Closer (escrow)\n3. Banii ajung la pro DOAR după ce confirmi că lucrarea e gata\n4. Primești bon digital automat\n\n**Nu ai nevoie de numerar.** Totul prin app pentru protecția ta."
    },
    quickReplies: ['pricing', 'guarantee', 'cancel']
  },

  // ---------- ACCOUNT ----------
  account: {
    keywords: ['account', 'profile', 'login', 'log in', 'sign in', 'register', 'sign up', 'password', 'email', 'delete', 'cont', 'profil', 'conectez', 'inregistrez', 'înregistrez', 'parola', 'parolă', 'sterge', 'șterge'],
    response: {
      en: "**Account help:**\n\n📱 **Create account:** Download the app → Sign up with email or Google/Apple → Verify your email → Done!\n\n🔑 **Forgot password:** Tap \"Forgot password\" on login → Enter your email → Check inbox for reset link\n\n✏️ **Edit profile:** Go to Profile tab → Tap Edit → Update your info\n\n🗑️ **Delete account:** Profile → Settings → Delete Account. All your data will be permanently removed within 30 days.\n\nNeed more help? Contact our support team!",
      ro: "**Ajutor cont:**\n\n📱 **Creare cont:** Descarcă app-ul → Înregistrează-te cu email sau Google/Apple → Verifică emailul → Gata!\n\n🔑 **Parolă uitată:** Apasă „Am uitat parola\" la login → Introdu emailul → Verifică inbox-ul\n\n✏️ **Editare profil:** Tab Profile → Apasă Edit → Actualizează informațiile\n\n🗑️ **Ștergere cont:** Profile → Settings → Delete Account. Toate datele vor fi șterse definitiv în 30 de zile.\n\nAi nevoie de ajutor suplimentar? Contactează echipa de suport!"
    },
    quickReplies: ['contact_support', 'payment', 'how_it_works']
  },

  // ---------- CONTACT SUPPORT ----------
  contact_support: {
    keywords: ['contact', 'support', 'help', 'talk', 'human', 'agent', 'email', 'phone', 'call', 'complaint', 'report', 'contact', 'suport', 'ajutor', 'vorbesc', 'om', 'agent', 'telefon', 'suna', 'sun', 'reclamatie', 'reclamație', 'raporteaza', 'raportează'],
    response: {
      en: "**Get in touch with us:**\n\n💬 **Live Chat** — You're using it right now! We respond within 15 minutes.\n\n📧 **Email:** support@closer-app.com — Response within 24 hours\n\n📱 **In-app:** Profile → Help & Support → Send a message\n\n⏰ **Hours:** 24/7 — yes, even at 3 AM!\n\n**For emergencies:** Use the \"I Need Help Now\" button for instant professional dispatch.\n\nWe're here for you. Always. 💚",
      ro: "**Contactează-ne:**\n\n💬 **Chat live** — Îl folosești chiar acum! Răspundem în maxim 15 minute.\n\n📧 **Email:** support@closer-app.com — Răspuns în 24 ore\n\n📱 **În app:** Profile → Help & Support → Trimite mesaj\n\n⏰ **Program:** 24/7 — da, chiar și la 3 dimineața!\n\n**Pentru urgențe:** Folosește butonul „I Need Help Now\" pentru trimitere instant a unui profesionist.\n\nSuntem aici pentru tine. Mereu. 💚"
    },
    quickReplies: ['how_it_works', 'guarantee', 'pricing']
  },

  // ---------- REVIEWS ----------
  reviews: {
    keywords: ['review', 'reviews', 'rating', 'ratings', 'feedback', 'star', 'stars', 'reputation', 'review', 'recenzie', 'recenzii', 'rating', 'nota', 'notă', 'stele', 'feedback', 'reputatie', 'reputație'],
    response: {
      en: "**Reviews on Closer are 100% authentic:**\n\n⭐ **Who can review:** Only clients who completed and paid for a job\n\n📝 **What you rate:** Overall satisfaction, punctuality, quality, communication (1-5 stars each)\n\n🚫 **No fake reviews:** We verify every review against a completed booking\n\n💬 **Pro can respond:** Professionals can reply publicly to reviews\n\n🏆 **Top Pro badge:** Pros with 4.8+ rating and 25+ reviews earn the Silver/Gold/Platinum badge",
      ro: "**Review-urile pe Closer sunt 100% autentice:**\n\n⭐ **Cine poate lăsa review:** Doar clienții care au finalizat și plătit un job\n\n📝 **Ce evaluezi:** Satisfacție generală, punctualitate, calitate, comunicare (1-5 stele)\n\n🚫 **Zero review-uri false:** Verificăm fiecare review cu o rezervare finalizată\n\n💬 **Pro-ul poate răspunde:** Profesioniștii pot răspunde public la review-uri\n\n🏆 **Badge Top Pro:** Pros cu 4.8+ rating și 25+ review-uri primesc badge Silver/Gold/Platinum"
    },
    quickReplies: ['verification', 'how_book', 'become_pro']
  },

  // ---------- GREETING ----------
  greeting: {
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'whats up', "what's up", 'sup', 'yo', 'salut', 'buna', 'bună', 'hei', 'neata', 'neață', 'ceau', 'servus'],
    response: {
      en: "Hey there! 👋 I'm Closer AI, your assistant. I can help you with:\n\n• Finding a professional\n• Understanding how Closer works\n• Pricing and fees\n• Becoming a pro yourself\n• Any questions about the app\n\nWhat would you like to know?",
      ro: "Salut! 👋 Sunt Closer AI, asistentul tău. Te pot ajuta cu:\n\n• Găsirea unui profesionist\n• Cum funcționează Closer\n• Prețuri și taxe\n• Să devii profesionist\n• Orice întrebări despre app\n\nCe vrei să afli?"
    },
    quickReplies: ['how_it_works', 'pricing', 'categories', 'become_pro']
  },

  // ---------- THANKS ----------
  thanks: {
    keywords: ['thank', 'thanks', 'thx', 'appreciate', 'helpful', 'great', 'awesome', 'perfect', 'multumesc', 'mulțumesc', 'mersi', 'ms', 'super', 'perfect', 'minunat'],
    response: {
      en: "You're welcome! Happy I could help. 😊\n\nIf you have more questions, just ask! I'm here 24/7.\n\nReady to find a professional? Just use the search bar at the top!",
      ro: "Cu plăcere! Mă bucur că te-am putut ajuta. 😊\n\nDacă mai ai întrebări, doar scrie! Sunt aici non-stop.\n\nGata să găsești un profesionist? Folosește bara de căutare de sus!"
    },
    quickReplies: ['how_book', 'categories', 'help_now']
  },

  // ---------- FALLBACK ----------
  fallback: {
    keywords: [],
    response: {
      en: "I'm not sure I understand that completely, but I'm here to help! Here's what I can tell you about:\n\n• How Closer works\n• Pricing and fees\n• Finding professionals\n• Becoming a pro\n• Emergency help\n• Safety and guarantees\n\nTap one of the options below or try rephrasing your question!",
      ro: "Nu sunt sigur că am înțeles complet, dar sunt aici să te ajut! Iată despre ce pot vorbi:\n\n• Cum funcționează Closer\n• Prețuri și taxe\n• Găsirea profesioniștilor\n• Să devii profesionist\n• Ajutor de urgență\n• Siguranță și garanții\n\nApasă pe una din opțiunile de mai jos sau reformulează întrebarea!"
    },
    quickReplies: ['how_it_works', 'pricing', 'categories', 'help_now', 'become_pro', 'contact_support']
  }
};


// Quick reply labels
const QUICK_REPLY_LABELS = {
  how_it_works:    { en: 'How it works',    ro: 'Cum funcționează' },
  pricing:         { en: 'Pricing & fees',  ro: 'Prețuri & taxe' },
  categories:      { en: 'All categories',  ro: 'Toate categoriile' },
  how_book:        { en: 'How to book',     ro: 'Cum rezerv' },
  cancel:          { en: 'Cancel/refund',   ro: 'Anulare/ramburs' },
  help_now:        { en: 'Help Now',        ro: 'Ajutor acum' },
  become_pro:      { en: 'Become a pro',    ro: 'Devino pro' },
  verification:    { en: 'Verification',    ro: 'Verificare' },
  guarantee:       { en: 'Guarantee',       ro: 'Garanție' },
  cities:          { en: 'Cities',          ro: 'Orașe' },
  payment:         { en: 'Payment',         ro: 'Plată' },
  account:         { en: 'Account help',    ro: 'Ajutor cont' },
  contact_support: { en: 'Contact us',      ro: 'Contactează-ne' },
  reviews:         { en: 'Reviews',         ro: 'Review-uri' }
};


// ============================================================
// 2. CHAT ENGINE — Intent detection + response selection
// ============================================================

function detectLanguage(text) {
  const roWords = ['buna', 'bună', 'cum', 'este', 'care', 'sunt', 'pot', 'vreau', 'trebuie', 'unde', 'cand', 'când', 'cat', 'cât', 'salut', 'mersi', 'imi', 'îmi', 'nu', 'da', 'și', 'sau', 'pentru', 'despre', 'asta'];
  const lower = text.toLowerCase();
  const roCount = roWords.filter(w => lower.includes(w)).length;
  return roCount >= 2 ? 'ro' : 'en';
}

function detectIntent(text) {
  const lower = text.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const [intentId, intentData] of Object.entries(KNOWLEDGE_BASE)) {
    if (intentId === 'fallback') continue;

    let score = 0;
    for (const keyword of intentData.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length;
        if (lower === keyword) score += 10;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = intentId;
    }
  }

  return bestScore >= 3 ? bestMatch : 'fallback';
}

function getResponse(intentId, locale = 'en') {
  const intent = KNOWLEDGE_BASE[intentId] || KNOWLEDGE_BASE.fallback;
  const text = intent.response[locale] || intent.response.en;
  const quickReplies = (intent.quickReplies || []).map(id => ({
    id,
    label: QUICK_REPLY_LABELS[id]?.[locale] || QUICK_REPLY_LABELS[id]?.en || id
  }));

  return { text, quickReplies, intentId };
}

function processMessage(userText) {
  const locale = detectLanguage(userText);
  const intentId = detectIntent(userText);
  const response = getResponse(intentId, locale);

  return {
    ...response,
    locale,
    timestamp: new Date()
  };
}


// ============================================================
// 3. REACT COMPONENT
// ============================================================

const CloserChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getResponse('greeting', 'en');
      setMessages([{
        id: 'welcome',
        type: 'bot',
        text: greeting.text,
        quickReplies: greeting.quickReplies,
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 400 + Math.random() * 600;
    setTimeout(() => {
      const response = processMessage(text);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response.text,
        quickReplies: response.quickReplies,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, delay);
  };

  const handleQuickReply = (replyId) => {
    const label = QUICK_REPLY_LABELS[replyId]?.en || replyId;
    sendMessage(label);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return <p key={i} style={{ margin: '2px 0' }} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <>
      <style>{`
        @keyframes closer-chat-bounce {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        @keyframes closer-chat-open {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes closer-chat-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes closer-chat-typing {
          0%, 60%, 100% { opacity: 1; transform: translateY(0); }
          30% { opacity: 0.3; transform: translateY(-3px); }
        }
        @keyframes closer-chat-pulse-badge {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.2); }
        }
        .closer-chat-typing-dot {
          animation: closer-chat-typing 1.2s ease-in-out infinite;
        }
        .closer-chat-typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .closer-chat-typing-dot:nth-child(3) { animation-delay: 0.3s; }
      `}</style>

      {/* ===== FLOATING ACTION BUTTON ===== */}
      <div
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          zIndex: 9999
        }}
      >
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2D5F4E 0%, #10B981 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(45, 95, 78, 0.4)',
              animation: 'closer-chat-bounce 2s ease-in-out infinite',
              position: 'relative'
            }}
            aria-label="Open chat"
          >
            <MessageCircle
              style={{ width: '24px', height: '24px', color: 'white' }}
              strokeWidth={2}
            />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#DC2626',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                  animation: 'closer-chat-pulse-badge 1.5s ease-in-out infinite'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        )}

        {/* ===== CHAT WINDOW ===== */}
        {isOpen && (
          <div
            style={{
              width: '340px',
              maxWidth: 'calc(100vw - 32px)',
              height: '480px',
              maxHeight: 'calc(100vh - 120px)',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'closer-chat-open 0.3s ease-out',
              border: '0.5px solid #E5E7EB'
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #2D5F4E 0%, #0F6E56 100%)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Sparkles style={{ width: '18px', height: '18px', color: 'white' }} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                  Closer AI
                </p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: '1px 0 0' }}>
                  Online — responds instantly
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Close chat"
              >
                <X style={{ width: '14px', height: '14px', color: 'white' }} strokeWidth={2.5} />
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: '#FAFAF8'
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    animation: 'closer-chat-msg-in 0.3s ease-out'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: msg.type === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      background: msg.type === 'user' ? '#2D5F4E' : 'white',
                      color: msg.type === 'user' ? 'white' : '#111827',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      border: msg.type === 'bot' ? '0.5px solid #E5E7EB' : 'none',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.type === 'bot' ? formatText(msg.text) : msg.text}
                  </div>

                  {msg.type === 'bot' && msg.quickReplies?.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        marginTop: '6px',
                        maxWidth: '85%'
                      }}
                    >
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr.id}
                          onClick={() => handleQuickReply(qr.id)}
                          style={{
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: '999px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            color: '#065F46',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#2D5F4E';
                            e.target.style.color = 'white';
                            e.target.style.borderColor = '#2D5F4E';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#F0FDF4';
                            e.target.style.color = '#065F46';
                            e.target.style.borderColor = '#BBF7D0';
                          }}
                        >
                          {qr.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      background: 'white',
                      border: '0.5px solid #E5E7EB',
                      borderRadius: '16px 16px 16px 4px',
                      padding: '12px 16px',
                      display: 'inline-flex',
                      gap: '4px'
                    }}
                  >
                    <span className="closer-chat-typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} />
                    <span className="closer-chat-typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} />
                    <span className="closer-chat-typing-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: '10px 12px',
                borderTop: '0.5px solid #E5E7EB',
                display: 'flex',
                gap: '8px',
                background: 'white',
                flexShrink: 0
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about Closer..."
                style={{
                  flex: 1,
                  border: '1px solid #E5E7EB',
                  borderRadius: '999px',
                  padding: '9px 14px',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#F9FAFB',
                  color: '#111827',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4ADE80'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: input.trim() ? '#2D5F4E' : '#E5E7EB',
                  border: 'none',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                aria-label="Send message"
              >
                <Send
                  style={{
                    width: '16px',
                    height: '16px',
                    color: input.trim() ? 'white' : '#9CA3AF'
                  }}
                  strokeWidth={2}
                />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default CloserChatBot;
