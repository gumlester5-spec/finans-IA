import { CATEGORIES } from '../constants';

export const suggestCategory = async (description: string): Promise<string> => {
  if (!description) {
    throw new Error("Description is required to suggest a category.");
  }
  
  try {
    const categories = CATEGORIES.expense;
    // Llama a nuestra propia función serverless en lugar de directamente a la API de Gemini
    const response = await fetch('/.netlify/functions/suggest-category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description, categories }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'El servicio de sugerencias de IA falló.');
    }

    const data = await response.json();
    const suggestedCategory = data.category;
    
    // El cliente sigue validando si la categoría es válida
    if (categories.includes(suggestedCategory)) {
      return suggestedCategory;
    }
    
    console.warn("Gemini returned a category not in the list:", suggestedCategory);
    return 'Otro'; // Fallback a 'Otro'
  } catch (error) {
    console.error("Error fetching category suggestion:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("No se pudo obtener la sugerencia de categoría de la IA.");
  }
};
