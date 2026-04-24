import React, { useState } from 'react';
import { Search, Sparkles, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CLOSER_AI_SYSTEM_PROMPT } from '../utils/aiPrompt';

// IMPORTANT: În producție, acest call ar trebui făcut printr-un backend propriu 
// pentru a nu expune cheia API în browser.
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export default function AISearchBar({ onSearchResult, onEmergencyTrigger }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: CLOSER_AI_SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: "application/json", // Forțează output-ul strict în JSON
          temperature: 0.1, // Temperatură mică pentru precizie și consistență
        }
      });

      const result = await model.generateContent(query);
      const responseText = result.response.text();
      const aiData = JSON.parse(responseText);

      // Redirecționăm flow-ul în funcție de urgența detectată
      if (aiData.urgency === 'emergency') {
        onEmergencyTrigger(aiData);
      } else {
        onSearchResult(aiData);
      }

    } catch (err) {
      console.error("AI Search Error:", err);
      setError("A apărut o eroare la conexiune. Te rugăm să încerci din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form 
        onSubmit={handleSearch}
        className={`relative flex items-center w-full bg-white rounded-full shadow-lg border-2 transition-all duration-300 ${
          isLoading ? 'border-[#2D5F4E] shadow-[#2D5F4E]/20' : 'border-transparent hover:border-[#2D5F4E]/30'
        }`}
      >
        <div className="pl-6 pr-3">
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-[#2D5F4E] animate-spin" />
          ) : (
            <Sparkles className="w-6 h-6 text-[#2D5F4E]" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: Mi s-a spart o țeavă la baie urgent..."
          disabled={isLoading}
          className="flex-1 py-4 px-2 text-lg text-gray-800 bg-transparent outline-none disabled:opacity-50 placeholder-gray-400"
        />

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="mr-2 my-2 px-6 py-3 bg-[#2D5F4E] hover:bg-[#1f4236] text-white rounded-full font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Caută</span>
          <Search className="w-5 h-5" />
        </button>
      </form>

      {/* Mesaj de eroare */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Helper text sub input */}
      <div className="mt-3 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-[#2D5F4E]/70" />
        <span>Closer AI identifică problema și estimează prețul instant.</span>
      </div>
    </div>
  );
}