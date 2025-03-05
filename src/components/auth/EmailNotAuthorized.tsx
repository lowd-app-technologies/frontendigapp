import React from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { AUTH_ERROR_MESSAGES } from '@/constants/auth.constant'

interface EmailNotAuthorizedProps {
    onBackToLogin: () => void
    email?: string
}

const EmailNotAuthorized = ({ onBackToLogin, email }: EmailNotAuthorizedProps) => {
    return (
        <div className="max-w-md mx-auto text-center py-6 px-4">
            <Alert showIcon className="mb-4" type="danger">
                <div className="flex items-center gap-1">
                    <HiOutlineExclamationCircle className="text-2xl" />
                    <h5 className="font-bold">Acesso Negado</h5>
                </div>
            </Alert>
            <div className="mb-6">
                <p className="text-lg mb-2">{AUTH_ERROR_MESSAGES.EMAIL_NOT_AUTHORIZED}</p>
                {email && (
                    <p className="text-sm text-gray-500">
                        O email <strong>{email}</strong> não possui permissão para acessar este aplicativo.
                    </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                    Entre em contato com o administrador para solicitar acesso.
                </p>
            </div>
            <Button
                variant="solid"
                onClick={onBackToLogin}
                className="mt-4"
            >
                Voltar ao Login
            </Button>
        </div>
    )
}

export default EmailNotAuthorized
