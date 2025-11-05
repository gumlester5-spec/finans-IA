
import { GoogleGenAI } from "@google/genai";
import { CATEGORIES } from '../constants';

export const suggestCategory = async (description: string): Promise<string> => {
  if (!description) {
    throw new Error("Description is required to suggest a category.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const categories = CATEGORIES.expense;
    const prompt = `Basado en la descripción de la transacción "${description}", ¿cuál de las siguientes categorías de gastos se ajusta mejor? Categorías: ${categories.join(', ')}. Responde únicamente con el nombre de la categoría de la lista. No añadas explicaciones ni texto adicional.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const suggestedCategory = response.text.trim();
    
    if (categories.includes(suggestedCategory)) {
      return suggestedCategory;
    }
    
    console.warn("Gemini returned a category not in the list:", suggestedCategory);
    return 'Otro'; // Fallback to 'Other'
  } catch (error) {
    console.error("Error suggesting category with Gemini:", error);
    throw new Error("No se pudo obtener la sugerencia de categoría de la IA.");
  }
};
