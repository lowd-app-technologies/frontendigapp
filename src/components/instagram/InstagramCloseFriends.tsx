import { useState, useEffect, useRef } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import { motion, AnimatePresence } from 'framer-motion'

interface InstagramCloseFriendsProps {
    className?: string
}

const InstagramCloseFriends = ({ className }: InstagramCloseFriendsProps) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<string[]>([])
    const [showForm, setShowForm] = useState(true)
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        if (messages.length > 0) {
            const interval = setInterval(() => {
                setCurrentMessageIndex((prevIndex) =>
                    prevIndex < messages.length - 1 ? prevIndex + 1 : prevIndex
                )
            }, 2000)

            return () => clearInterval(interval)
        }
    }, [messages])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessages(['Iniciando processo...'])
        setShowForm(false)
        setCurrentMessageIndex(0)

        const ws = new WebSocket('wss://pythonfastapi-production-437e.up.railway.app/ws')

        wsRef.current = ws

        ws.onopen = () => {
            ws.send(JSON.stringify({ username, password }))
        }

        ws.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data])

            if (event.data.includes('Autenticação bem-sucedida! Adicionando usuários ao Close Friends...')) {
                setLoading(false)
            }
        }
    }

    const handleStopService = async () => {
        try {
            const response = await fetch('https://pythonfastapi-production-437e.up.railway.app/stop', { method: 'POST' })

            if (response.ok) {
                if (wsRef.current) {
                    wsRef.current.onmessage = (event) => {
                        if (event.data.includes('Processo interrompido!')) {
                            wsRef.current?.close()
                            wsRef.current = null
                        }
                    }
                }

                setMessages((prev) => [...prev, 'Processo interrompido!'])
                setLoading(false)

                const interval = setInterval(() => {
                    setShowForm(true)
                    clearInterval(interval)
                }, 5000)
            } else {
                setMessages((prev) => [...prev, 'Erro ao interromper o processo!'])
            }
        } catch (error) {
            console.error('Erro ao interromper o processo:', error)
            setMessages((prev) => [...prev, 'Erro ao interromper o processo!'])
        }
    }

    return (
        <div className={`flex flex-col items-center p-6 bg-gray-50 min-h-screen justify-center ${className || ''}`}>
            <h1 className="text-3xl font-bold text-center mb-6">
                Adicionar Close Friends
            </h1>
            {showForm ? (
                <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
                    <Input
                        type="text"
                        placeholder="Usuário"
                        className="w-full"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Senha"
                        className="w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        variant="solid"
                        className="w-full"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : 'Iniciar'}
                    </Button>
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
                    {loading && <Progress percent={100} className="w-full mt-4" variant="line" />}
                    {loading === false && (
                        <Button
                            variant="solid"
                            className="w-full mt-4 bg-red-600 hover:bg-red-700"
                            type="button"
                            onClick={handleStopService}
                            disabled={loading}
                        >
                            Encerrar
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}

export default InstagramCloseFriends
