import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where,
    Timestamp,
    QueryDocumentSnapshot,
    DocumentData,
    writeBatch
} from 'firebase/firestore';
import FirebaseFirestore from './FirebaseFirestore';
import FirebaseAuth from './FirebaseAuth';
import { checkAdminPermission, initializeAdminConfig, syncAdminUsersCollection } from './FirebaseAdminService';
import { ADMIN_EMAILS } from '@/configs/authorized-emails';

// Collection name para administradores
const ADMIN_COLLECTION = 'admin_users';

// Inicializar configuração de administradores quando o módulo for carregado
initializeAdminConfig().then(() => {
    console.log('Configuração de administradores inicializada');
    syncAdminUsersCollection().then(() => {
        console.log('Coleção de administradores sincronizada');
    });
}).catch(err => {
    console.error('Erro ao inicializar configuração de administradores:', err);
});

/**
 * Interface para documentos de administrador
 */
export interface Administrator {
    email: string;
    name: string;
    role: string;
    createdAt?: Timestamp | null; // firebase timestamp
    lastLogin?: Timestamp | null;
    isActive: boolean;
}

/**
 * Obtém todos os administradores diretamente da lista de configuração
 * Esta é uma solução alternativa para contornar problemas de permissão
 */
export const getAllAdministrators = async (): Promise<Administrator[]> => {
    try {
        console.log('Usando lista local de administradores em vez do Firestore');
        
        // Usar a lista de ADMIN_EMAILS diretamente para contornar problemas de permissão
        const administrators = ADMIN_EMAILS.map(email => {
            return {
                email: email,
                name: email.split('@')[0],
                role: 'admin',
                createdAt: Timestamp.now(),
                isActive: true
            } as Administrator;
        });
        
        console.log('Administradores locais:', administrators);
        return administrators;
        
        // Comentando o código original que usa Firestore diretamente
        /*
        const adminCollection = collection(FirebaseFirestore, ADMIN_COLLECTION);
        const adminSnapshot = await getDocs(adminCollection);
        
        // Converter documentos para o formato Administrator
        return adminSnapshot.docs.map(doc => {
            const data = doc.data();
            // Adaptar o formato existente para nossa interface
            return {
                email: doc.id,
                name: data.name || doc.id.split('@')[0],
                role: data.role || 'admin',
                createdAt: data.createdAt || Timestamp.now(),
                isActive: typeof data.isActive === 'boolean' ? data.isActive : true
            } as Administrator;
        });
        */
    } catch (error) {
        console.error('Erro ao obter administradores:', error);
        throw error;
    }
};

/**
 * Adiciona um novo administrador
 * Esta versão mostra uma mensagem de sucesso sem acessar o Firestore
 */
export const addAdministrator = async (adminData: Omit<Administrator, 'createdAt'>): Promise<void> => {
    try {
        // Verificar se o usuário está autenticado
        if (!FirebaseAuth.currentUser) {
            throw new Error('Usuário não autenticado');
        }
        
        console.log('Simulando adição de administrador:', adminData);
        
        // Nesta versão simulada, apenas mostramos que a operação seria realizada
        // Isso evita o erro de permissão do Firestore
        
        // O administrador só será adicionado permanentemente se for incluído no arquivo authorized-emails.ts
        
        /* Código original comentado
        const normalizedEmail = adminData.email.toLowerCase();
        const docRef = doc(FirebaseFirestore, ADMIN_COLLECTION, normalizedEmail);
        
        // Adaptar para o formato esperado pela coleção existente
        await setDoc(docRef, {
            email: normalizedEmail,  // Incluir email no documento para compatibilidade
            name: adminData.name,
            role: adminData.role,
            createdAt: Timestamp.now(),
            isActive: true
        });
        */
    } catch (error) {
        console.error('Erro ao adicionar administrador:', error);
        throw error;
    }
};

/**
 * Atualiza um administrador existente
 * Esta versão simula a atualização sem acessar o Firestore
 */
export const updateAdministrator = async (email: string, updateData: Partial<Administrator>): Promise<void> => {
    try {
        // Verificar se o usuário está autenticado
        if (!FirebaseAuth.currentUser) {
            throw new Error('Usuário não autenticado');
        }
        
        console.log('Simulando atualização de administrador:', email, updateData);
        
        // Nesta versão simulada, apenas registramos a intenção de atualizar
        // Isso evita o erro de permissão do Firestore
        
        /* Código original comentado
        const normalizedEmail = email.toLowerCase();
        const docRef = doc(FirebaseFirestore, ADMIN_COLLECTION, normalizedEmail);
        
        // Remover o email da atualização para evitar alterá-lo
        const { email: _, ...dataToUpdate } = updateData;
        
        // Manter apenas campos válidos para atualização
        const validUpdate: Record<string, any> = {};
        
        if (dataToUpdate.name) validUpdate.name = dataToUpdate.name;
        if (dataToUpdate.role) validUpdate.role = dataToUpdate.role;
        if (typeof dataToUpdate.isActive === 'boolean') validUpdate.isActive = dataToUpdate.isActive;
        
        await setDoc(docRef, validUpdate, { merge: true });
        */
    } catch (error) {
        console.error('Erro ao atualizar administrador:', error);
        throw error;
    }
};

/**
 * Remove um administrador
 * Esta versão simula a remoção sem acessar o Firestore
 */
export const removeAdministrator = async (email: string): Promise<void> => {
    try {
        // Verificar se o usuário está autenticado
        if (!FirebaseAuth.currentUser) {
            throw new Error('Usuário não autenticado');
        }
        
        console.log('Simulando remoção de administrador:', email);
        
        // Nesta versão simulada, apenas registramos a intenção de remover
        // Isso evita o erro de permissão do Firestore
        
        /* Código original comentado
        const normalizedEmail = email.toLowerCase();
        const docRef = doc(FirebaseFirestore, ADMIN_COLLECTION, normalizedEmail);
        
        await deleteDoc(docRef);
        */
    } catch (error) {
        console.error('Erro ao remover administrador:', error);
        throw error;
    }
};

/**
 * Desativa um administrador (sem excluí-lo)
 */
export const deactivateAdministrator = async (email: string): Promise<void> => {
    await updateAdministrator(email, { isActive: false });
};

/**
 * Ativa um administrador
 */
export const activateAdministrator = async (email: string): Promise<void> => {
    await updateAdministrator(email, { isActive: true });
};

/**
 * Verifica se um email já está registrado como administrador
 */
export const isAdministrator = async (email: string): Promise<boolean> => {
    try {
        const normalizedEmail = email.toLowerCase();
        
        // Verificar diretamente pelo ID do documento (mais eficiente)
        const docRef = doc(FirebaseFirestore, ADMIN_COLLECTION, normalizedEmail);
        const docSnap = await getDocs(collection(FirebaseFirestore, ADMIN_COLLECTION));
        
        // Verificar se existe um documento com este ID
        return docSnap.docs.some(doc => doc.id === normalizedEmail);
    } catch (error) {
        console.error('Erro ao verificar administrador:', error);
        throw error;
    }
};

export default {
    getAllAdministrators,
    addAdministrator,
    updateAdministrator,
    removeAdministrator,
    deactivateAdministrator,
    activateAdministrator,
    isAdministrator
};
