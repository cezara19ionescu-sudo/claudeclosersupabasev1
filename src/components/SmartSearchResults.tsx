import React, { useState, useEffect, useMemo } from 'react';
import { SmartSearchEngine } from '../utils/CloserSmartSearch';
import { rankPros, generateSmartSummary, BUDGET_RANGES, TIMING_OPTIONS, JOB_SIZES, CATEGORY_BUDGETS } from '../utils/CloserSmartFilters';
import { PROS, CATS, SUB_IC } from '../constants';
import { Star, MapPin, Search, Zap, Clock, ChevronDown, ChevronRight, DollarSign, Filter, Sparkles, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { Professional } from '../types';

const engine = new SmartSearchEngine();

// ── Mapping from SmartSearchEngine names → CATS ids ──
const CAT_NAME_TO_ID: Record<string, string> = {
  'Home & Maintenance': 'home',
  'Beauty & Wellness': 'beauty',
  'Auto & Transport': 'auto',
  'Events': 'events',
  'Education': 'edu',
  'IT & Tech': 'tech',
  'Pet Care': 'pets',
  'Health & Fitness': 'health',
  'Legal & Admin': 'legal',
  'Gardening': 'garden',
  'Cleaning': 'home',
  'Home Office': 'office',
  'Lifestyle': 'life',
};

// ── Mapping from SmartSearchEngine subcategory names → CATS sub names ──
const SUB_NAME_TO_CATS: Record<string, string> = {
  'Caterer': 'Catering',
  'Makeup Artist': 'Makeup',
  'Massage Therapist': 'Massage',
  'Dog Walker': 'Dog Walking',
  'Pet Sitter': 'Pet Sitting',
  'Dog Groomer': 'Grooming',
  'Lawn Care': 'Lawn Mowing',
  'Tree Surgeon': 'Tree Surgery',
  'Landscaper': 'Garden Design',
  'Computer Repair': 'PC Repair',
  'WiFi / Network': 'Network Setup',
  'House Cleaning': 'Cleaner',
  'Carpet Cleaning': 'Cleaner',
  'Car Wash': 'Valeting',
  'Tyre Service': 'MOT',
  'Tutor': 'Maths Tutor',
  'Music Teacher': 'Music',
  'Language Teacher': 'Language',
  'Yoga Instructor': 'Yoga',
  'Accountant': 'Accounting',
  'Translator': 'Translation',
  'Personal Trainer': 'Personal Trainer',
};

function resolveCategory(engineCat: string): string {
  return CAT_NAME_TO_ID[engineCat] || engineCat.toLowerCase();
}

function resolveSubcategory(engineSub: string): string {
  return SUB_NAME_TO_CATS[engineSub] || engineSub;
}

interface SmartSearchResultsProps {
  query: string;
  onSelectPro: (pro: Professional) => void;
  onSelectSubcategory?: (categoryId: string, subcategoryName: string) => void;
  isEmergency?: boolean;
  allPros: Professional[];
}

export function SmartSearchResults({ query, onSelectPro, onSelectSubcategory, isEmergency, allPros }: SmartSearchResultsProps) {
  const [filters, setFilters] = useState<{
    timing?: string;
    budget?: string;
    jobSize?: string;
    matchedCategory?: string;
    matchedSubcategory?: string;
    budgetRanges?: any[];
  }>({});
  
  const [activeFilterMenu, setActiveFilterMenu] = useState<'timing' | 'budget' | 'jobSize' | null>(null);

  const searchResults = useMemo(() => {
    return engine.search(query);
  }, [query]);

  useEffect(() => {
    if (searchResults.categories.length > 0 || searchResults.subcategories.length > 0) {
      const topCat = searchResults.categories[0] || searchResults.subcategories[0]?.category;
      const topSub = searchResults.subcategories[0]?.subcategory;
      const resolvedSub = topSub ? resolveSubcategory(topSub) : undefined;
      const budgetRanges = (CATEGORY_BUDGETS.UK as any)[resolvedSub || ''] || BUDGET_RANGES.UK;
      
      setFilters({
        matchedCategory: topCat,
        matchedSubcategory: resolvedSub,
        budgetRanges,
      });
    } else {
      setFilters({});
    }
    setActiveFilterMenu(null);
  }, [searchResults]);

  const toggleFilter = (type: 'timing' | 'budget' | 'jobSize', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? undefined : value
    }));
    setActiveFilterMenu(null);
  };

  // ── Build subcategory results with proper mapping ──
  const subcategoryResults = useMemo(() => {
    const seen = new Set<string>();
    const results: Array<{
      catId: string;
      catLabel: string;
      subName: string;
      score: number;
      prosCount: number;
      topPros: any[];
      avgRating: number;
      bestPrice: number | null;
    }> = [];

    // From engine subcategory matches
    for (const subMatch of searchResults.subcategories) {
      const catId = resolveCategory(subMatch.category);
      const subName = resolveSubcategory(subMatch.subcategory);
      const key = `${catId}::${subName}`;
      if (seen.has(key)) continue;
      seen.add(key);

      let prosInSub = allPros.filter(p => p.sub === subName && p.catId === catId);
      if (isEmergency) prosInSub = prosInSub.filter(p => p.isEmergencyAvailable);
      if (prosInSub.length === 0) continue;

      const ranked = rankPros(prosInSub, filters);
      const cat = CATS.find(c => c.id === catId);
      const avgRating = prosInSub.reduce((sum, p) => sum + p.rating, 0) / prosInSub.length;
      const bestPrice = Math.min(...prosInSub.filter(p => p.price).map(p => p.price));

      results.push({
        catId,
        catLabel: cat?.label?.replace(/\\n/g, ' ') || catId,
        subName,
        score: subMatch.score,
        prosCount: ranked.length,
        topPros: ranked.slice(0, 4),
        avgRating: Math.round(avgRating * 10) / 10,
        bestPrice: isFinite(bestPrice) ? bestPrice : null,
      });
    }

    // If engine only matched categories (no subs), show ALL subs from those categories
    if (results.length === 0 && searchResults.categories.length > 0) {
      for (const engineCat of searchResults.categories) {
        const catId = resolveCategory(engineCat);
        const cat = CATS.find(c => c.id === catId);
        if (!cat) continue;

        for (const subName of cat.subs) {
          const key = `${catId}::${subName}`;
          if (seen.has(key)) continue;
          seen.add(key);

          let prosInSub = allPros.filter(p => p.sub === subName && p.catId === catId);
          if (isEmergency) prosInSub = prosInSub.filter(p => p.isEmergencyAvailable);
          if (prosInSub.length === 0) continue;

          const ranked = rankPros(prosInSub, filters);
          const avgRating = prosInSub.reduce((sum, p) => sum + p.rating, 0) / prosInSub.length;
          const bestPrice = Math.min(...prosInSub.filter(p => p.price).map(p => p.price));

          results.push({
            catId,
            catLabel: cat.label.replace(/\\n/g, ' '),
            subName,
            score: 2,
            prosCount: ranked.length,
            topPros: ranked.slice(0, 4),
            avgRating: Math.round(avgRating * 10) / 10,
            bestPrice: isFinite(bestPrice) ? bestPrice : null,
          });
        }
      }
    }

    // Also do a direct text search against CATS subs/aliases as fallback
    if (results.length === 0 && query.trim().length >= 2) {
      const q = query.trim().toLowerCase();
      for (const cat of CATS) {
        for (const subName of cat.subs) {
          if (subName.toLowerCase().includes(q) || q.includes(subName.toLowerCase())) {
            const key = `${cat.id}::${subName}`;
            if (seen.has(key)) continue;
            seen.add(key);

            let prosInSub = allPros.filter(p => p.sub === subName && p.catId === cat.id);
            if (isEmergency) prosInSub = prosInSub.filter(p => p.isEmergencyAvailable);
            if (prosInSub.length === 0) continue;

            const ranked = rankPros(prosInSub, filters);
            const avgRating = prosInSub.reduce((sum, p) => sum + p.rating, 0) / prosInSub.length;
            const bestPrice = Math.min(...prosInSub.filter(p => p.price).map(p => p.price));

            results.push({
              catId: cat.id,
              catLabel: cat.label.replace(/\\n/g, ' '),
              subName,
              score: 3,
              prosCount: ranked.length,
              topPros: ranked.slice(0, 4),
              avgRating: Math.round(avgRating * 10) / 10,
              bestPrice: isFinite(bestPrice) ? bestPrice : null,
            });
          }
        }
      }
    }

    // Sort: highest score first
    results.sort((a, b) => b.score - a.score);

    // Filter out weak matches:
    if (results.length > 0) {
      const topScore = results[0].score;
      // If top score is very low (generic search), we show almost everything that matched (threshold 0)
      // If top score is high, we show results within 40% of the top
      const threshold = topScore < 8 ? 0 : topScore * 0.4;
      return results.filter(r => r.score >= threshold);
    }

    return results;
  }, [searchResults, filters, isEmergency, query]);

  if (!query || query.trim().length < 2) return null;

  const totalPros = subcategoryResults.reduce((sum, s) => sum + s.prosCount, 0);

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Smart Filters Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 relative">
        <div className="px-5 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveFilterMenu(activeFilterMenu === 'timing' ? null : 'timing')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-colors whitespace-nowrap shrink-0",
              filters.timing ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            {filters.timing ? TIMING_OPTIONS.find(t => t.id === filters.timing)?.label : "When?"}
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>

          <button 
            onClick={() => setActiveFilterMenu(activeFilterMenu === 'budget' ? null : 'budget')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-colors whitespace-nowrap shrink-0",
              filters.budget ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <DollarSign className="w-3.5 h-3.5" />
            {filters.budget ? (filters.budgetRanges || BUDGET_RANGES.UK).find((b: any) => b.id === filters.budget)?.label : "Budget"}
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>

          <button 
            onClick={() => setActiveFilterMenu(activeFilterMenu === 'jobSize' ? null : 'jobSize')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-colors whitespace-nowrap shrink-0",
              filters.jobSize ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            {filters.jobSize ? JOB_SIZES.find(j => j.id === filters.jobSize)?.label : "Job Size"}
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
        </div>

        {/* Filter Dropdowns */}
        {activeFilterMenu === 'timing' && (
          <div className="absolute left-5 right-5 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in slide-in-from-top-2">
            {TIMING_OPTIONS.map(opt => (
              <button 
                key={opt.id}
                onClick={() => toggleFilter('timing', opt.id)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between"
              >
                <span className={cn("text-[14px]", filters.timing === opt.id ? "font-bold text-teal-700" : "text-slate-700")}>{opt.label}</span>
                {opt.isUrgent && <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />}
              </button>
            ))}
          </div>
        )}

        {activeFilterMenu === 'budget' && (
          <div className="absolute left-5 right-5 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in slide-in-from-top-2">
            {(filters.budgetRanges || BUDGET_RANGES.UK).map((opt: any) => (
              <button 
                key={opt.id}
                onClick={() => toggleFilter('budget', opt.id)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5"
              >
                <span className={cn("text-[14px]", filters.budget === opt.id ? "font-bold text-teal-700" : "font-semibold text-slate-700")}>{opt.label}</span>
                <span className="text-[12px] text-slate-500">{opt.sublabel}</span>
              </button>
            ))}
          </div>
        )}

        {activeFilterMenu === 'jobSize' && (
          <div className="absolute left-5 right-5 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in slide-in-from-top-2">
            {JOB_SIZES.map(opt => (
              <button 
                key={opt.id}
                onClick={() => toggleFilter('jobSize', opt.id)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5"
              >
                <span className={cn("text-[14px]", filters.jobSize === opt.id ? "font-bold text-teal-700" : "font-semibold text-slate-700")}>{opt.label}</span>
                <span className="text-[12px] text-slate-500">{opt.sublabel}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-8 bg-slate-50 min-h-screen">
        {/* Summary */}
        <div className="text-[13px] text-slate-500 mb-4 ml-1 font-medium flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-teal-500" />
          {subcategoryResults.length > 0 
            ? `Found ${subcategoryResults.length} matching ${subcategoryResults.length === 1 ? 'category' : 'categories'} · ${totalPros} pros available`
            : 'Searching...'}
        </div>

        {/* ── Subcategory Cards (ONLY these, no individual pros) ── */}
        <div className="flex flex-col gap-4">
          {subcategoryResults.map((sub, idx) => {
            // "Relevant Sum" logic: match % is shared among results that are close to the top score.
            // This prevents low-score "noise" from diluting a strong specific match.
            const topScore = subcategoryResults[0]?.score || 1;
            const relevantResults = subcategoryResults.filter(r => r.score >= (topScore * 0.5));
            const relevantSum = relevantResults.reduce((sum, r) => sum + r.score, 0);
            
            const denominator = Math.max(relevantSum, 1);
            const rawPercentage = (sub.score / denominator) * 97;
            
            const displayPercentage = Math.min(99, Math.max(5, Math.round(rawPercentage)));
            
            // Only mark as best match if it's significantly better than the rest and has a good absolute score
            const isBest = idx === 0 && sub.score >= 8 && (sub.score / denominator) > 0.6;
            const icon = SUB_IC[sub.subName] || '🔍';

            return (
              <div 
                key={`${sub.catId}-${sub.subName}`}
                onClick={() => onSelectSubcategory?.(sub.catId, sub.subName)}
                className={cn(
                  "bg-white rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.98] border shadow-sm relative overflow-hidden group",
                  isBest 
                    ? "border-amber-300 ring-1 ring-amber-200 shadow-md" 
                    : "border-slate-100 hover:border-teal-200 hover:shadow-md"
                )}
              >
                {/* Match Badge */}
                <div className={cn(
                  "absolute top-0 right-0 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl shadow-sm z-10 flex items-center gap-1",
                  isBest 
                    ? "bg-gradient-to-r from-amber-400 to-amber-500" 
                    : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                )}>
                  {isBest && <Star className="w-3 h-3 fill-white" />}
                  {!isBest && <Sparkles className="w-3 h-3 fill-white" />}
                  {displayPercentage}% MATCH
                </div>

                {isBest && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-br-xl shadow-sm z-10 tracking-wider">
                    BEST MATCH
                  </div>
                )}
                
                {/* Subcategory Info */}
                <div className="flex items-start gap-4 pr-20">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-[22px] shrink-0 shadow-sm",
                    isBest ? "bg-amber-50 ring-1 ring-amber-200" : "bg-slate-50"
                  )}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-[17px] leading-tight">{sub.subName}</h3>
                    <p className="text-teal-700 text-[13px] font-medium mt-0.5">{sub.catLabel}</p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-3 mt-2 text-[12px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-bold text-slate-700">{sub.avgRating}</span>
                        <span>avg</span>
                      </div>
                      {sub.bestPrice && (
                        <div className="flex items-center font-semibold text-slate-600">
                          from £{sub.bestPrice}/hr
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Pros Preview Row */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {sub.topPros.map((p: any, i: number) => (
                        <div key={i} className="w-9 h-9 rounded-full border-[2.5px] border-white overflow-hidden bg-slate-100 shadow-sm">
                          {p.img ? (
                            <img src={p.img} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[12px] font-bold bg-teal-100 text-teal-800">
                              {p.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[13px] font-bold text-slate-600">
                        {sub.prosCount} {sub.prosCount === 1 ? 'pro' : 'pros'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-teal-600 text-[12px] font-bold group-hover:translate-x-0.5 transition-transform">
                    View all <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
          
          {subcategoryResults.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="font-bold text-slate-500">No categories found for this search.</p>
              <p className="text-[13px] mt-1">Try different keywords like "plumber", "haircut", or "catering".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
