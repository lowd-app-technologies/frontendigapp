import React, { useState, useEffect } from 'react'
import { Button, Input, Card, Alert } from '@/components/ui'
import { Tag } from '@/components/ui'
import { 
    getAllAuthorizedEmails, 
    addAuthorizedEmail, 
    removeAuthorizedEmail 
} from '@/services/AuthorizationService'

const AuthorizedEmails = () => {
    const [emails, setEmails] = useState<string[]>([])
    const [newEmail, setNewEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Carrega a lista de emails autorizados
    const loadEmails = async () => {
        setLoading(true)
        try {
            const emailList = await getAllAuthorizedEmails()
            setEmails(emailList)
            setError('')
        } catch (err) {
            setError('Erro ao carregar emails autorizados')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Carrega a lista de emails ao montar o componente
    useEffect(() => {
        loadEmails()
    }, [])

    // Adiciona um novo email autorizado
    const handleAddEmail = async () => {
        if (!newEmail) {
            setError('Por favor, insira um email')
            return
        }

        if (!isValidEmail(newEmail)) {
            setError('Por favor, insira um email válido')
            return
        }

        setLoading(true)
        try {
            const success = await addAuthorizedEmail(newEmail)
            if (success) {
                setSuccess(`Email ${newEmail} adicionado com sucesso`)
                setNewEmail('')
                await loadEmails()
            } else {
                setError('Erro ao adicionar email')
            }
        } catch (err) {
            setError('Erro ao adicionar email')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Remove um email da lista de autorizados
    const handleRemoveEmail = async (email: string) => {
        setLoading(true)
        try {
            const success = await removeAuthorizedEmail(email)
            if (success) {
                setSuccess(`Email ${email} removido com sucesso`)
                await loadEmails()
            } else {
                setError('Erro ao remover email')
            }
        } catch (err) {
            setError('Erro ao remover email')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Valida o formato do email
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <div className="mb-6">
                    <h4 className="mb-2">Gerenciar Emails Autorizados</h4>
                    <p className="text-gray-500">
                        Adicione ou remova emails que têm permissão para acessar o aplicativo
                    </p>
                </div>

                {error && (
                    <Alert type="danger" showIcon className="mb-4">
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert type="success" showIcon className="mb-4">
                        {success}
                    </Alert>
                )}

                <div className="flex items-center gap-2 mb-6">
                    <Input
                        placeholder="Email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddEmail()
                            }
                        }}
                    />
                    <Button
                        variant="solid"
                        onClick={handleAddEmail}
                        loading={loading}
                    >
                        Adicionar
                    </Button>
                </div>

                <div>
                    <h5 className="mb-4">Emails Autorizados</h5>
                    {emails.length === 0 ? (
                        <p className="text-gray-500">Nenhum email autorizado encontrado</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {emails.map((email) => (
                                <Tag
                                    key={email}
                                    className="mb-2"
                                    prefix={
                                        <span className="cursor-pointer" onClick={() => handleRemoveEmail(email)}>
                                            ✕
                                        </span>
                                    }
                                >
                                    {email}
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default AuthorizedEmails
