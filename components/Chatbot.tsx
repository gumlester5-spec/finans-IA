import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { Transaction } from '../types';
import { askChatbot } from '../services/chatService';

interface ChatbotProps {
    transactions: Transaction[];
}

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ transactions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: '¡Hola! Soy tu asistente financiero. Pregúntame sobre tus transacciones.' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages: Message[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const botResponse = await askChatbot(userInput, transactions);
            setMessages([...newMessages, { sender: 'bot', text: botResponse }]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Lo siento, algo salió mal.";
            setMessages([...newMessages, { sender: 'bot', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 left-6 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-110 z-20"
                aria-label="Abrir chat de asistente"
            >
                {ICONS.chat}
            </button>

            {isOpen && (
                 <div className="fixed bottom-24 left-6 w-[calc(100%-3rem)] max-w-md h-2/3 max-h-[600px] bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-20 transition-all duration-300 transform-gpu origin-bottom-left">
                    <div className="flex justify-between items-center p-4 bg-gray-900 rounded-t-2xl">
                        <h3 className="text-lg font-bold text-white">Asistente Financiero</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-end gap-2 justify-start">
                                <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-gray-900 rounded-b-2xl">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Escribe tu pregunta..."
                                className="flex-1 bg-gray-700 border-gray-600 rounded-full py-2 px-4 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-indigo-600 text-white p-2 rounded-full disabled:bg-indigo-400 hover:bg-indigo-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
