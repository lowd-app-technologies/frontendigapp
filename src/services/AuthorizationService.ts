import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import FirebaseFirestore from './firebase/FirebaseFirestore';
import { AUTHORIZED_EMAILS } from '@/configs/authorized-emails';

const COLLECTION_NAME = 'authorized_emails';

// Cache para armazenar resultados de verificação de emails
const emailAuthorizationCache: Record<string, boolean> = {};

/**
 * Verifica se um email está autorizado a acessar o aplicativo
 * Primeiro verifica na lista estática local, depois no cache
 * e por último consulta o Firestore se necessário
 */
export const isEmailAuthorized = async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    // Normaliza o email para minúsculas
    const normalizedEmail = email.toLowerCase();
    
    // Passo 1: Verificar na lista local estática (mais rápido)
    if (AUTHORIZED_EMAILS.includes(normalizedEmail)) {
        return true;
    }
    
    // Passo 2: Verificar no cache (evita consultas repetidas)
    if (normalizedEmail in emailAuthorizationCache) {
        return emailAuthorizationCache[normalizedEmail];
    }
    
    try {
        // Passo 3: Consultar o Firestore
        const q = query(
            collection(FirebaseFirestore, COLLECTION_NAME),
            where('email', '==', normalizedEmail)
        );
        
        const querySnapshot = await getDocs(q);
        
        // Armazena o resultado no cache
        const isAuthorized = !querySnapshot.empty;
        emailAuthorizationCache[normalizedEmail] = isAuthorized;
        
        return isAuthorized;
    } catch (error) {
        console.error('Erro ao verificar email autorizado:', error);
        // Em caso de erro na consulta, retorna false por segurança
        return false;
    }
};

/**
 * Adiciona um email à lista de emails autorizados
 */
export const addAuthorizedEmail = async (email: string): Promise<boolean> => {
    try {
        const normalizedEmail = email.toLowerCase();
        const docRef = doc(FirebaseFirestore, COLLECTION_NAME, normalizedEmail);
        
        await setDoc(docRef, {
            email: normalizedEmail,
            createdAt: new Date()
        });
        
        // Atualiza o cache
        emailAuthorizationCache[normalizedEmail] = true;
        
        return true;
    } catch (error) {
        console.error('Erro ao adicionar email autorizado:', error);
        return false;
    }
};

/**
 * Remove um email da lista de emails autorizados
 */
export const removeAuthorizedEmail = async (email: string): Promise<boolean> => {
    try {
        const normalizedEmail = email.toLowerCase();
        const docRef = doc(FirebaseFirestore, COLLECTION_NAME, normalizedEmail);
        
        await deleteDoc(docRef);
        
        // Atualiza o cache
        emailAuthorizationCache[normalizedEmail] = false;
        
        return true;
    } catch (error) {
        console.error('Erro ao remover email autorizado:', error);
        return false;
    }
};

/**
 * Retorna a lista de todos os emails autorizados
 */
export const getAllAuthorizedEmails = async (): Promise<string[]> => {
    try {
        const q = collection(FirebaseFirestore, COLLECTION_NAME);
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map((doc) => doc.data().email);
    } catch (error) {
        console.error('Erro ao buscar emails autorizados:', error);
        return [];
    }
};
