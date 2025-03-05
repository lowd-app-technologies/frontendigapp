import React, { useState, useEffect } from 'react'
import { Button, Input, Card, Alert, Tag } from '@/components/ui'
import { ADMIN_EMAILS, AUTHORIZED_EMAILS } from '@/configs/authorized-emails'
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import FirebaseFirestore from '@/services/firebase/FirebaseFirestore'
import type { Meta } from '@/@types/routes'

const COLLECTION_NAME = 'admin_users'

const AdminUsers = <T extends Meta>(_props: T) => {
    const [adminUsers, setAdminUsers] = useState<string[]>([])
    const [newAdmin, setNewAdmin] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Carrega a lista de administradores
    const loadAdminUsers = async () => {
        setLoading(true)
        try {
            // Combinar a lista estática de ADMIN_EMAILS com os admins do Firestore
            const staticAdmins = [...ADMIN_EMAILS]
            
            try {
                // Buscar admins do Firestore
                const collectionRef = collection(FirebaseFirestore, COLLECTION_NAME)
                const querySnapshot = await getDocs(collectionRef)
                
                const firestoreAdmins = querySnapshot.docs.map(doc => doc.data().email)
                
                // Combinar e remover duplicatas
                const allAdmins = [...new Set([...staticAdmins, ...firestoreAdmins])]
                setAdminUsers(allAdmins)
            } catch (firestoreError) {
                console.error('Erro ao buscar administradores do Firestore:', firestoreError)
                // Se falhar ao buscar do Firestore, usar apenas a lista estática
                setAdminUsers(staticAdmins)
            }
            
            setError('')
        } catch (err) {
            setError('Erro ao carregar lista de administradores')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Carrega a lista de administradores ao montar o componente
    useEffect(() => {
        loadAdminUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Adiciona um novo administrador
    const handleAddAdmin = async () => {
        if (!newAdmin) {
            setError('Por favor, insira um email')
            return
        }

        if (!isValidEmail(newAdmin)) {
            setError('Por favor, insira um email válido')
            return
        }

        // Verificar se é um usuário autorizado
        if (!AUTHORIZED_EMAILS.includes(newAdmin.toLowerCase())) {
            setError(`O email ${newAdmin} não está na lista de emails autorizados`)
            return
        }

        // Prevenir duplicatas
        if (adminUsers.includes(newAdmin.toLowerCase())) {
            setError(`O email ${newAdmin} já é um administrador`)
            return
        }

        setLoading(true)
        try {
            // Adicionar ao Firestore
            const normalizedEmail = newAdmin.toLowerCase()
            const docRef = doc(FirebaseFirestore, COLLECTION_NAME, normalizedEmail)
            
            await setDoc(docRef, {
                email: normalizedEmail,
                createdAt: new Date()
            })
            
            setSuccess(`Administrador ${newAdmin} adicionado com sucesso`)
            setNewAdmin('')
            
            // Atualizar a lista local sem fazer nova consulta
            setAdminUsers(prev => [...prev, normalizedEmail])
        } catch (err) {
            setError('Erro ao adicionar administrador')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Remove um administrador
    const handleRemoveAdmin = async (email: string) => {
        // Verificar se está na lista estática
        if (ADMIN_EMAILS.includes(email.toLowerCase())) {
            setError(`Não é possível remover ${email} - está na lista estática`)
            return
        }

        setLoading(true)
        try {
            // Remover do Firestore
            const normalizedEmail = email.toLowerCase()
            const docRef = doc(FirebaseFirestore, COLLECTION_NAME, normalizedEmail)
            
            await deleteDoc(docRef)
            
            setSuccess(`Administrador ${email} removido com sucesso`)
            
            // Atualizar a lista local sem fazer nova consulta
            setAdminUsers(prev => prev.filter(e => e !== normalizedEmail))
        } catch (err) {
            setError('Erro ao remover administrador')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    // Valida o formato do email
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // Verifica se um email está na lista estática
    const isStaticAdmin = (email: string) => {
        return ADMIN_EMAILS.includes(email.toLowerCase())
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="mb-4">
                <div className="mb-6">
                    <h4 className="mb-2">Gerenciar Administradores</h4>
                    <p className="text-gray-500">
                        Adicione ou remova usuários com permissões de administrador
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
                        value={newAdmin}
                        onChange={(e) => setNewAdmin(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAddAdmin()
                            }
                        }}
                    />
                    <Button
                        variant="solid"
                        onClick={handleAddAdmin}
                        loading={loading}
                    >
                        Adicionar
                    </Button>
                </div>

                <div>
                    <h5 className="mb-4">Administradores</h5>
                    {adminUsers.length === 0 ? (
                        <p className="text-gray-500">Nenhum administrador encontrado</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {adminUsers.map((email) => (
                                <Tag
                                    key={email}
                                    className="mb-2"
                                    prefix={
                                        <span 
                                            className={`cursor-pointer mr-2 ${isStaticAdmin(email) ? 'text-gray-400' : ''}`}
                                            onClick={() => !isStaticAdmin(email) && handleRemoveAdmin(email)}
                                            title={isStaticAdmin(email) ? "Não pode ser removido (lista estática)" : "Clique para remover"}
                                        >
                                            {isStaticAdmin(email) ? "⚙️" : "✕"}
                                        </span>
                                    }
                                >
                                    {email}
                                    {isStaticAdmin(email) && (
                                        <span className="ml-1 text-xs bg-gray-200 px-1 rounded">fixo</span>
                                    )}
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="mb-2">Observações:</h5>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                        <li className="mb-1">
                            Os administradores marcados como <span className="font-mono bg-gray-200 px-1 rounded">fixo</span> estão 
                            definidos no código-fonte e não podem ser removidos desta interface.
                        </li>
                        <li className="mb-1">
                            Para adicionar um administrador, o email já deve estar na lista de emails autorizados.
                        </li>
                        <li>
                            Administradores têm acesso a todas as funcionalidades de gerenciamento da plataforma.
                        </li>
                    </ul>
                </div>
            </Card>
        </div>
    )
}

export default AdminUsers
