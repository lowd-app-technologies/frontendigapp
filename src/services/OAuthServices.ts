import { User as FirebaseUser } from 'firebase/auth'
import { signInWithFirebaseGoogle } from './firebase/FirebaseGoogleAuth'
import type { SignInResponse } from '../@types/auth'
import { isEmailAuthorized } from '@/services/AuthorizationService'
import { isAdminEmail } from '@/configs/authorized-emails'
import { AUTH_ERROR_MESSAGES } from '@/constants/auth.constant'

type FirebaseOAuthResponse = {
    token: string
    user: FirebaseUser
}

// Fallback para ambiente de desenvolvimento ou testes
async function placeholderFunction(): Promise<SignInResponse> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                token: 'placeholder_token',
                user: {
                    userId: 'placeholder_id',
                    userName: 'Placeholder User',
                    authority: ['user'],
                    avatar: '',
                    email: 'user@example.com',
                },
            })
        }, 500)
    })
}

export async function apiGoogleOauthSignIn(): Promise<SignInResponse> {
    try {
        const response = await signInWithFirebaseGoogle()
        
        // Verificar se o email está autorizado
        if (response.user.email) {
            const isAuthorized = await isEmailAuthorized(response.user.email);
            if (!isAuthorized) {
                throw new Error(AUTH_ERROR_MESSAGES.EMAIL_NOT_AUTHORIZED);
            }
        }
        
        // Converter o usuário do Firebase para o formato esperado pela aplicação
        return {
            token: response.token,
            user: {
                userId: response.user.uid,
                userName: response.user.displayName || 'Google User',
                authority: isAdminEmail(response.user.email || '') ? ['admin', 'user'] : ['user'],
                avatar: response.user.photoURL || '',
                email: response.user.email || '',
            }
        }
    } catch (error) {
        console.error('Error during Google OAuth sign-in:', error)
        // Fallback para desenvolvimento ou teste
        if (process.env.NODE_ENV !== 'production') {
            return await placeholderFunction()
        }
        throw error
    }
}

export async function apiGithubOauthSignIn(): Promise<SignInResponse> {
    // Implemente a autenticação GitHub com Firebase quando necessário
    return await placeholderFunction()
}
