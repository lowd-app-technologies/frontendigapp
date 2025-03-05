import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
} from '../@types/auth'

import { isEmailAuthorized } from '@/services/AuthorizationService'
import { AUTH_ERROR_MESSAGES } from '@/constants/auth.constant'

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
} from 'firebase/auth'
import FirebaseAuth from './firebase/FirebaseAuth'

export async function apiSignIn(data: SignInCredential): Promise<SignInResponse> {
    try {
        // Verificar se o email está autorizado
        const isAuthorized = await isEmailAuthorized(data.email);
        if (!isAuthorized) {
            throw new Error(AUTH_ERROR_MESSAGES.EMAIL_NOT_AUTHORIZED);
        }
        
        const resp = await signInWithEmailAndPassword(FirebaseAuth, data.email, data.password);
        const token = await resp.user.getIdToken();
        
        // Converter o usuário do Firebase para o formato esperado pela aplicação
        return {
            token,
            user: {
                userId: resp.user.uid,
                userName: resp.user.displayName || 'User',
                authority: ['user'], // Definir autoridades padrão
                avatar: resp.user.photoURL || '',
                email: resp.user.email || '',
            }
        };
    } catch (error) {
        console.error('Sign in failed:', error);
        throw error;
    }
}

export async function apiSignUp(data: SignUpCredential): Promise<SignUpResponse> {
    try {
        // Verificar se o email está autorizado
        const isAuthorized = await isEmailAuthorized(data.email);
        if (!isAuthorized) {
            throw new Error(AUTH_ERROR_MESSAGES.EMAIL_NOT_AUTHORIZED);
        }
        
        const resp = await createUserWithEmailAndPassword(FirebaseAuth, data.email, data.password);
        const token = await resp.user.getIdToken();
        
        // Aqui você pode adicionar mais informações do usuário ao Firestore se necessário
        // Por exemplo, salvar o nome de usuário que não é armazenado automaticamente pelo Firebase
        
        // Converter o usuário do Firebase para o formato esperado pela aplicação
        return {
            token,
            user: {
                userId: resp.user.uid,
                userName: data.userName, // Usar o nome fornecido durante o cadastro
                authority: ['user'], // Definir autoridades padrão
                avatar: resp.user.photoURL || '',
                email: resp.user.email || '',
            }
        };
    } catch (error) {
        console.error('Sign up failed:', error);
        throw error;
    }
}

export async function apiSignOut() {
    try {
        await signOut(FirebaseAuth);
        return { success: true };
    } catch (error) {
        console.error('Sign out failed:', error);
        throw error;
    }
}

export async function apiForgotPassword(data: ForgotPassword): Promise<boolean> {
    try {
        await sendPasswordResetEmail(FirebaseAuth, data.email);
        return true;
    } catch (error) {
        console.error('Password reset email failed:', error);
        throw error;
    }
}

export async function apiResetPassword(data: ResetPassword): Promise<boolean> {
    // Para redefinição de senha com token, o Firebase geralmente lida com isso através do link enviado por email
    // Esta função pode não ser necessária com o Firebase, pois o processo é diferente
    // Se você precisar de funcionalidade personalizada, pode implementá-la aqui
    
    console.warn('apiResetPassword: Com o Firebase, a redefinição de senha é geralmente tratada através do link enviado por email');
    return true;
}
