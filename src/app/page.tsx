"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (messages.length > 0) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => 
          prevIndex < messages.length - 1 ? prevIndex + 1 : prevIndex
        );
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessages(["Iniciando processo..."]);
    setShowForm(false);
    setCurrentMessageIndex(0);

    const ws = new WebSocket("wss://pythonfastapi-production-437e.up.railway.app/ws");
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ username, password }));
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      setLoading(false);
    };
  };
  
  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen justify-center">
      <h1 className="text-3xl font-bold text-center mb-6">Adicionar Close Friends</h1>
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
          <input
            type="text"
            placeholder="Usuário"
            className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 transition duration-200"
            disabled={loading}
          >
            {loading ? "Processando..." : "Iniciar"}
          </button>
        </form>
      ) : (
        <div className="w-full max-w-md text-center">
          <AnimatePresence mode="wait">
            {messages.length > 0 && (
              <motion.p
                key={messages[currentMessageIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-lg font-semibold text-blue-600"
              >
                {messages[currentMessageIndex]}
              </motion.p>
            )}
          </AnimatePresence>
          {loading && <Progress value={100} className="w-full mt-4" />}  
        </div>
      )}
    </div>
  );
}
