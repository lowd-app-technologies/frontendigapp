import { useState, useRef } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Progress from "@/components/ui/Progress";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { HiCheckCircle, HiLockClosed } from "react-icons/hi";

interface InstagramCloseFriendsProps {
  className?: string;
}

const InstagramCloseFriends = ({ className }: InstagramCloseFriendsProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessages(["Iniciando processo..."]);
    setShowForm(false);

    const ws = new WebSocket(
      "wss://pythonfastapi-production-437e.up.railway.app/ws"
    );

    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ username, password }));
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);

      if (
        event.data.includes(
          "Autenticação bem-sucedida! Adicionando usuários ao Close Friends..."
        )
      ) {
        setLoading(false);
        setIsAuthenticated(true);
      }
    };
  };

  const handleStopService = async () => {
    try {
      // Adicionar mensagem de feedback imediato
      setMessages((prev) => [...prev, "Solicitando interrupção do processo..."]);
      
      const response = await fetch(
        "https://pythonfastapi-production-437e.up.railway.app/stop",
        { 
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Fecha o WebSocket imediatamente
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
        
        // Limpa a referência do WebSocket
        wsRef.current = null;
        
        // Atualiza os estados
        setMessages((prev) => [...prev, "Processo interrompido com sucesso!"]);
        setLoading(false);
        setIsAuthenticated(false);
        
        // Retorna ao formulário após um atraso
        setTimeout(() => {
          setShowForm(true);
        }, 3000);
      } else {
        // Tenta ler o erro da resposta
        const errorText = await response.text();
        console.error("Erro na resposta do servidor:", errorText);
        setMessages((prev) => [...prev, `Erro ao interromper o processo: ${response.status} ${response.statusText}`]);
      }
    } catch (error) {
      console.error("Erro ao interromper o processo:", error);
      setMessages((prev) => [...prev, `Erro ao interromper o processo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]);
      
      // Tentativa de recuperação em caso de erro
      if (wsRef.current) {
        try {
          wsRef.current.close();
          wsRef.current = null;
          setMessages((prev) => [...prev, "WebSocket fechado forçadamente."]);
          
          // Retorna ao formulário após um atraso mesmo em caso de erro
          setTimeout(() => {
            setShowForm(true);
            setLoading(false);
          }, 3000);
        } catch (closeError) {
          console.error("Erro ao fechar WebSocket:", closeError);
        }
      }
    }
  };

  return (
    <div
      className={`flex flex-col items-center p-6 bg-neutral justify-center ${className || ""}`}
      style={{ padding: "40px", borderRadius: "12px", height: "100%" }}
    >
      <Card
                header={{
                    content: 'Login Instagram',
                    extra: (
                      <AnimatePresence mode="wait">
                        {isAuthenticated ? (
                          <motion.span 
                            key="authenticated"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center text-green-500"
                          >
                            <HiCheckCircle className="mr-1 text-lg" /> 
                            Autenticado
                          </motion.span>
                        ) : (
                          <motion.span 
                            key="awaiting"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center text-blue-500"
                          >
                            <HiLockClosed className="mr-1" /> 
                            Aguardando login
                          </motion.span>
                        )}
                      </AnimatePresence>
                    )
                }}
                footer={{
                    content: <span className="text-xs text-gray-500">
                               Seus dados são tratados com segurança
                             </span>
                }}
            >
                <p className="text-sm font-bold text-center mb-6">
                  O login do instagram será usado para adicionar usuários ao Close
                  Friends.
                </p>
                
                <AnimatePresence mode="wait" initial={false}>
                  {showForm ? (
                    <motion.form 
                      key="login-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4 }}
                      onSubmit={handleSubmit} 
                      className="space-y-6 w-full max-w-md"
                    >
                      <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <Input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Digite seu username do Instagram"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Senha</label>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Digite sua senha do Instagram"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        variant="solid"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <Progress percent={50} showInfo={false} size="sm" variant="circle" /> 
                            <span className="ml-2">Processando...</span>
                          </div>
                        ) : (
                          <span>Iniciar processo</span>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="processing-area"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6 w-full max-w-md"
                    >
                      <motion.p 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-sm font-bold text-center mb-6"
                      >
                        Processo em andamento...
                      </motion.p>
                      <ul className="space-y-2">
                        <AnimatePresence>
                          {messages.map((message, index) => (
                            <motion.li 
                              key={index} 
                              initial={{ opacity: 0, height: 0, y: 20 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="text-sm text-gray-500 overflow-hidden p-2 border-l-2 border-blue-300"
                            >
                              {message}
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Button
                          onClick={handleStopService}
                          variant="solid"
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Parar processo
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </Card>
    </div>
    
  );
};

export default InstagramCloseFriends;
