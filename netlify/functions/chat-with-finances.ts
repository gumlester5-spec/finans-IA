import { GoogleGenAI } from "@google/genai";
import type { Handler } from "@netlify/functions";
import { Transaction } from "../../types";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    const { query, transactions } = JSON.parse(event.body || '{}');

    if (!query || !transactions || !Array.isArray(transactions)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Faltan la consulta o las transacciones en la solicitud.' }),
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

    // Simplificar el historial de transacciones para el prompt
    const transactionHistory = transactions.map((t: Transaction) => 
      `${t.type === 'income' ? 'Ingreso' : 'Gasto'}: ${t.amount} en ${t.category} (${t.description}) el ${new Date(t.date).toLocaleDateString('es-ES')}`
    ).join('\n');
    
    const prompt = `
      Eres un asistente financiero amigable y útil. Tu única fuente de conocimiento son los datos de las transacciones proporcionados a continuación.
      No inventes información. Basa tus respuestas únicamente en estos datos.
      
      Aquí están las transacciones del usuario:
      ---
      ${transactionHistory.length > 0 ? transactionHistory : "No hay transacciones todavía."}
      ---
      
      Pregunta del usuario: "${query}"
      
      Por favor, responde a la pregunta del usuario de forma concisa y directa, basándote en los datos de las transacciones.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const botResponse = response.text.trim();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ response: botResponse }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error) {
    console.error("Error en la función de chat de Netlify:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "No se pudo obtener una respuesta de la IA." }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
