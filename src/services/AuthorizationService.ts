import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import FirebaseFirestore from './firebase/FirebaseFirestore';

const COLLECTION_NAME = 'authorized_emails';

/**
 * Verifica se um email está autorizado a acessar o aplicativo
 * consultando o Firestore
 */
export const isEmailAuthorized = async (email: string): Promise<boolean> => {
    try {
        // Normaliza o email para minúsculas
        const normalizedEmail = email.toLowerCase();
        
        // Cria uma query para buscar o email específico
        const q = query(
            collection(FirebaseFirestore, COLLECTION_NAME),
            where('email', '==', normalizedEmail)
        );
        
        // Executa a query
        const querySnapshot = await getDocs(q);
        
        // Se encontrou algum documento, o email está autorizado
        return !querySnapshot.empty;
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
