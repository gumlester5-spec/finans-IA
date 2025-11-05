import { Transaction } from '../types';

export const askChatbot = async (query: string, transactions: Transaction[]): Promise<string> => {
    if (!query) {
        throw new Error("La consulta no puede estar vacía.");
    }
    
    try {
        const response = await fetch('/.netlify/functions/chat-with-finances', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, transactions }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'El asistente de IA falló en responder.');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error al contactar al chatbot:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("No se pudo obtener una respuesta del asistente de IA.");
    }
};
