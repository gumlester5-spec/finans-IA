import { GoogleGenAI } from "@google/genai";
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    const { description, categories } = JSON.parse(event.body || '{}');

    if (!description || !categories || !Array.isArray(categories)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Faltan la descripción o las categorías en la solicitud.' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    if (!process.env.API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'La clave de API no está configurada en el servidor.' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Basado en la descripción de la transacción "${description}", ¿cuál de las siguientes categorías de gastos se ajusta mejor? Categorías: ${categories.join(', ')}. Responde únicamente con el nombre de la categoría de la lista. No añadas explicaciones ni texto adicional.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const suggestedCategory = response.text.trim();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ category: suggestedCategory }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener la sugerencia de la IA." }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
