import { SmartSearchEngine } from '../utils/CloserSmartSearch';

const engine = new SmartSearchEngine();

export async function obtineAnalizaCautarii(mesajulUtilizatorului: string) {
  try {
    const results = engine.search(mesajulUtilizatorului);
    if (!results || !results.aiResponse) return null;
    
    const resp = results.aiResponse;
    return {
      category: results.categories[0] || 'Lifestyle',
      subcategory: results.subcategories[0] || '',
      urgency: resp.urgency,
      estimated_price: resp.estimated_price,
      recommend_help_now: resp.urgency === 'emergency',
      suggested_options: results.chips || [],
      safety_tip: resp.safety_tip,
      friendly_message: resp.friendly_message
    };

  } catch (error: any) {
    console.error("Eroare la AI Search:", error);
    return {
      error: "general_error",
      friendly_message: "Ne cerem scuze, am întâmpinat o problemă cu asistentul AI. Totuși, rezultatele standard au fost încărcate pentru tine."
    };
  }
}
