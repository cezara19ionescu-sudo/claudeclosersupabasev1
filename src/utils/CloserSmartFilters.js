/**
 * CloserSmartFilters — Extension for CloserSmartSearch
 * ====================================================
 * 
 * Adds 3 optional smart filters that appear AFTER AI matches category:
 *  1. Timing    — Now (ASAP) / Today / This week
 *  2. Budget    — Budget (<£40) / Mid-range (£40-60) / Premium (£60+)
 *  3. Job Size  — Quick fix (<1hr) / Half day (2-4hr) / Full project (1+ days)
 * 
 * Also adds:
 *  - Match scoring (98%, 92%, etc.) for each pro
 *  - "BEST" badge for top match
 *  - Smart summary card
 *  - Pro tag system (In budget, Available now, 98% match)
 * 
 * Import alongside SmartSearchEngine:
 *   import { SmartSearchEngine } from './CloserSmartSearch';
 *   import { SmartFilters, matchProToFilters, BUDGET_RANGES, TIMING_OPTIONS, JOB_SIZES } from './CloserSmartFilters';
 */


// ============================================================
// 1. FILTER OPTIONS (pre-configured per market)
// ============================================================

export const TIMING_OPTIONS = [
  {
    id: 'now',
    label: 'Now',
    sublabel: 'ASAP',
    icon: 'zap',
    isUrgent: true,
    filterFn: (pro) => pro.availableNow === true || pro.respondTime <= 30
  },
  {
    id: 'today',
    label: 'Today',
    sublabel: 'flexible',
    icon: 'clock',
    isUrgent: false,
    filterFn: (pro) => pro.availableToday === true
  },
  {
    id: 'this_week',
    label: 'This week',
    sublabel: 'schedule',
    icon: 'calendar',
    isUrgent: false,
    filterFn: (pro) => true // all pros are available this week
  }
];

export const TIMING_OPTIONS_RO = [
  { id: 'now', label: 'Acum', sublabel: 'urgent' },
  { id: 'today', label: 'Azi', sublabel: 'flexibil' },
  { id: 'this_week', label: 'Săptămâna asta', sublabel: 'programare' }
];


export const BUDGET_RANGES = {
  UK: [
    {
      id: 'budget',
      label: 'Budget',
      sublabel: 'under £40/hr',
      min: 0,
      max: 40,
      currency: '£'
    },
    {
      id: 'mid',
      label: 'Mid-range',
      sublabel: '£40 - £60/hr',
      min: 40,
      max: 60,
      currency: '£'
    },
    {
      id: 'premium',
      label: 'Premium',
      sublabel: '£60+/hr',
      min: 60,
      max: 999,
      currency: '£'
    }
  ],
  RO: [
    {
      id: 'budget',
      label: 'Economic',
      sublabel: 'sub 80 RON/hr',
      min: 0,
      max: 80,
      currency: 'RON'
    },
    {
      id: 'mid',
      label: 'Standard',
      sublabel: '80 - 150 RON/hr',
      min: 80,
      max: 150,
      currency: 'RON'
    },
    {
      id: 'premium',
      label: 'Premium',
      sublabel: '150+ RON/hr',
      min: 150,
      max: 9999,
      currency: 'RON'
    }
  ]
};

// Category-specific budget ranges (override defaults)
export const CATEGORY_BUDGETS = {
  UK: {
    "Plumber":          [{ id: 'budget', sublabel: 'under £40/hr' }, { id: 'mid', sublabel: '£40-60/hr' }, { id: 'premium', sublabel: '£60+/hr' }],
    "Electrician":      [{ id: 'budget', sublabel: 'under £45/hr' }, { id: 'mid', sublabel: '£45-70/hr' }, { id: 'premium', sublabel: '£70+/hr' }],
    "Painter":          [{ id: 'budget', sublabel: 'under £25/hr' }, { id: 'mid', sublabel: '£25-40/hr' }, { id: 'premium', sublabel: '£40+/hr' }],
    "Nail Tech":        [{ id: 'budget', sublabel: 'under £20'   }, { id: 'mid', sublabel: '£20-35'    }, { id: 'premium', sublabel: '£35+'    }],
    "Hairdresser":      [{ id: 'budget', sublabel: 'under £25'   }, { id: 'mid', sublabel: '£25-50'    }, { id: 'premium', sublabel: '£50+'    }],
    "Dog Walker":       [{ id: 'budget', sublabel: 'under £10'   }, { id: 'mid', sublabel: '£10-15'    }, { id: 'premium', sublabel: '£15+'    }],
    "Tutor":            [{ id: 'budget', sublabel: 'under £20/hr' }, { id: 'mid', sublabel: '£20-35/hr' }, { id: 'premium', sublabel: '£35+/hr' }],
    "Mechanic":         [{ id: 'budget', sublabel: 'under £40/hr' }, { id: 'mid', sublabel: '£40-65/hr' }, { id: 'premium', sublabel: '£65+/hr' }],
    "House Cleaning":   [{ id: 'budget', sublabel: 'under £15/hr' }, { id: 'mid', sublabel: '£15-25/hr' }, { id: 'premium', sublabel: '£25+/hr' }],
    "Personal Trainer": [{ id: 'budget', sublabel: 'under £30/hr' }, { id: 'mid', sublabel: '£30-50/hr' }, { id: 'premium', sublabel: '£50+/hr' }],
  },
  RO: {
    "Plumber":          [{ id: 'budget', sublabel: 'sub 60 RON/hr' }, { id: 'mid', sublabel: '60-120 RON' }, { id: 'premium', sublabel: '120+' }],
    "Electrician":      [{ id: 'budget', sublabel: 'sub 80 RON/hr' }, { id: 'mid', sublabel: '80-150 RON' }, { id: 'premium', sublabel: '150+' }],
    "Nail Tech":        [{ id: 'budget', sublabel: 'sub 50 RON'    }, { id: 'mid', sublabel: '50-100 RON' }, { id: 'premium', sublabel: '100+' }],
  }
};


export const JOB_SIZES = [
  {
    id: 'quick',
    label: 'Quick fix',
    labelRo: 'Rapid',
    sublabel: 'under 1 hour',
    sublabelRo: 'sub 1 oră',
    icon: 'zap',
    durationHours: { min: 0, max: 1 }
  },
  {
    id: 'half_day',
    label: 'Half day',
    labelRo: 'Jumătate de zi',
    sublabel: '2 - 4 hours',
    sublabelRo: '2 - 4 ore',
    icon: 'clock',
    durationHours: { min: 2, max: 4 }
  },
  {
    id: 'project',
    label: 'Full project',
    labelRo: 'Proiect complet',
    sublabel: '1+ days',
    sublabelRo: '1+ zile',
    icon: 'calendar',
    durationHours: { min: 8, max: 999 }
  }
];


// ============================================================
// 2. MATCH SCORING ALGORITHM
// ============================================================

/**
 * Calculate how well a pro matches the user's filters
 * Returns: { score: 0-100, tags: string[], isBest: boolean }
 */
export function matchProToFilters(pro, filters = {}) {
  let score = 50; // base score
  const tags = [];

  // Category/subcategory match (from search engine)
  if (filters.matchedSubcategory && pro.subcategory === filters.matchedSubcategory) {
    score += 25;
    tags.push({ text: 'Skill match', type: 'match' });
  } else if (filters.matchedCategory && pro.category === filters.matchedCategory) {
    score += 15;
  }

  // Rating bonus
  if (pro.rating >= 4.8) {
    score += 10;
    tags.push({ text: 'Top rated', type: 'match' });
  } else if (pro.rating >= 4.5) {
    score += 5;
  }

  // Reviews count bonus
  if (pro.reviewCount >= 40) {
    score += 5;
  } else if (pro.reviewCount >= 20) {
    score += 3;
  }

  // Timing filter
  if (filters.timing) {
    const timingOption = TIMING_OPTIONS.find(t => t.id === filters.timing);
    if (timingOption && timingOption.filterFn(pro)) {
      score += 10;
      if (filters.timing === 'now') {
        tags.push({ text: 'Available now', type: 'fast' });
      }
    } else {
      score -= 15; // penalty for not matching timing
    }
  }

  // Budget filter
  if (filters.budget && pro.pricePerHour) {
    const budgetOption = filters.budgetRanges?.find(b => b.id === filters.budget);
    if (budgetOption) {
      if (pro.pricePerHour >= budgetOption.min && pro.pricePerHour <= budgetOption.max) {
        score += 10;
        tags.push({ text: 'In budget', type: 'budget' });
      } else if (pro.pricePerHour < budgetOption.min) {
        score += 5; // cheaper than budget = still good
        tags.push({ text: 'Under budget', type: 'budget' });
      } else {
        score -= 10; // over budget
      }
    }
  }

  // Job size filter (match pro's typical job duration)
  if (filters.jobSize && pro.typicalJobHours) {
    const sizeOption = JOB_SIZES.find(s => s.id === filters.jobSize);
    if (sizeOption) {
      const proMin = pro.typicalJobHours.min || 0;
      const proMax = pro.typicalJobHours.max || 999;
      const overlap = proMin <= sizeOption.durationHours.max && proMax >= sizeOption.durationHours.min;
      if (overlap) {
        score += 5;
      } else {
        score -= 5;
      }
    }
  }

  // Distance bonus
  if (pro.distanceMinutes) {
    if (pro.distanceMinutes <= 15) {
      score += 5;
      tags.push({ text: 'Nearby', type: 'fast' });
    } else if (pro.distanceMinutes <= 30) {
      score += 2;
    }
  }

  // Verified bonus
  if (pro.isVerified) {
    score += 3;
  }
  if (pro.hasDBS) {
    score += 2;
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Round to look natural (not exact numbers)
  score = Math.round(score);

  return {
    score,
    tags,
    isBest: false // will be set after comparing all pros
  };
}


/**
 * Score and rank all pros, mark the best one
 */
export function rankPros(pros, filters) {
  const scored = pros.map(pro => {
    const match = matchProToFilters(pro, filters);
    return { ...pro, matchScore: match.score, matchTags: match.tags };
  });

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Mark the best one
  if (scored.length > 0) {
    scored[0].isBest = true;
  }

  return scored;
}


// ============================================================
// 3. SMART SUMMARY GENERATOR
// ============================================================

export function generateSmartSummary(searchResults, filters, locale = 'en') {
  const lines = [];

  // What they're looking for
  if (searchResults?.aiResponse?.matchedSubcategory) {
    const sub = searchResults.aiResponse.matchedSubcategory;
    lines.push({
      en: `${sub} for ${searchResults.aiResponse.matchedCategory?.toLowerCase() || 'your job'}`,
      ro: `${sub} pentru lucrarea ta`
    });
  }

  // Timing
  if (filters.timing) {
    const t = TIMING_OPTIONS.find(o => o.id === filters.timing);
    const tRo = TIMING_OPTIONS_RO.find(o => o.id === filters.timing);
    if (t) {
      lines.push({
        en: `Available ${t.label}${t.isUrgent ? ' (urgent)' : ''}`,
        ro: `Disponibil ${tRo?.label || t.label}${t.isUrgent ? ' (urgent)' : ''}`
      });
    }
  }

  // Budget
  if (filters.budget) {
    const ranges = filters.budgetRanges || BUDGET_RANGES.UK;
    const b = ranges.find(r => r.id === filters.budget);
    if (b) {
      lines.push({
        en: `Budget: ${b.sublabel}`,
        ro: `Buget: ${b.sublabel}`
      });
    }
  }

  // Job size
  if (filters.jobSize) {
    const s = JOB_SIZES.find(j => j.id === filters.jobSize);
    if (s) {
      lines.push({
        en: `${s.label} (${s.sublabel})`,
        ro: `${s.labelRo} (${s.sublabelRo})`
      });
    }
  }

  return lines.map(l => locale === 'ro' ? l.ro : l.en);
}


// ============================================================
// 4. AI RESPONSE ENHANCER (after filters selected)
// ============================================================

export function enhanceAIResponse(baseResponse, filters, matchedProsCount, totalProsCount) {
  if (!baseResponse) return null;

  const parts = [];
  
  if (filters.timing === 'now') {
    parts.push(`${matchedProsCount} are available RIGHT NOW.`);
  } else {
    parts.push(`${matchedProsCount} of ${totalProsCount} match your criteria.`);
  }

  if (filters.budget) {
    const budgetLabel = filters.budget === 'budget' ? 'within budget' :
                        filters.budget === 'mid' ? 'in your price range' :
                        'premium options';
    parts.push(`All ${budgetLabel}.`);
  }

  if (filters.jobSize === 'quick') {
    parts.push('Quick fixes are their specialty.');
  }

  return {
    ...baseResponse,
    enhancedText: parts.join(' '),
    matchedCount: matchedProsCount,
    totalCount: totalProsCount
  };
}


// ============================================================
// 5. USAGE EXAMPLE
// ============================================================

/*
import { SmartSearchEngine } from './CloserSmartSearch';
import { 
  rankPros, 
  generateSmartSummary, 
  enhanceAIResponse,
  BUDGET_RANGES, 
  TIMING_OPTIONS, 
  JOB_SIZES,
  CATEGORY_BUDGETS 
} from './CloserSmartFilters';

const engine = new SmartSearchEngine();

// Step 1: User types
const searchResults = engine.search("my sink is leaking");

// Step 2: User optionally selects filters
const filters = {
  timing: 'now',
  budget: 'mid',
  jobSize: 'quick',
  matchedCategory: searchResults.categories[0],
  matchedSubcategory: searchResults.subcategories[0]?.subcategory,
  budgetRanges: CATEGORY_BUDGETS.UK['Plumber'] || BUDGET_RANGES.UK
};

// Step 3: Score and rank pros
const pros = [
  { 
    name: 'Alexandru C.', 
    category: 'Home & Maintenance',
    subcategory: 'Plumber',
    rating: 4.9, 
    reviewCount: 47, 
    pricePerHour: 45,
    distanceMinutes: 12,
    availableNow: true,
    availableToday: true,
    isVerified: true,
    hasDBS: true,
    respondTime: 15,
    typicalJobHours: { min: 0.5, max: 4 }
  },
  // ... more pros
];

const rankedPros = rankPros(pros, filters);

// rankedPros[0] = { 
//   ...alexandru, 
//   matchScore: 98, 
//   matchTags: [
//     { text: 'Skill match', type: 'match' },
//     { text: 'Available now', type: 'fast' },
//     { text: 'In budget', type: 'budget' },
//     { text: 'Top rated', type: 'match' }
//   ],
//   isBest: true 
// }

// Step 4: Generate summary
const summary = generateSmartSummary(searchResults, filters, 'en');
// ["Plumber for home & maintenance", "Available Now (urgent)", "Budget: £40-60/hr", "Quick fix (under 1 hour)"]

// Step 5: Enhance AI response
const enhanced = enhanceAIResponse(
  searchResults.aiResponse, 
  filters, 
  rankedPros.filter(p => p.matchScore >= 70).length,
  rankedPros.length
);
// "3 are available RIGHT NOW. All in your price range. Quick fixes are their specialty."
*/
