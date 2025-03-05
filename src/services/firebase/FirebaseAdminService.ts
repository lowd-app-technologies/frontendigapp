import { 
    collection, 
    doc, 
    setDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where, 
    Timestamp,
    getFirestore,
    getDoc,
    writeBatch
} from 'firebase/firestore';
import FirebaseFirestore from './FirebaseFirestore';
import { ADMIN_EMAILS } from '@/configs/authorized-emails';
import { Administrator } from './AdminService';

// Coleções usadas pelo serviço
const ADMIN_COLLECTION = 'admin_users';
const ADMIN_CONFIG_COLLECTION = 'admin_config';
const ADMIN_LIST_DOC = 'admin_list';  // Documento que armazena a lista de administradores

/**
 * Inicializa a configuração de administradores no Firestore
 * Isso garante que temos um documento com a lista de emails administrativos
 * permitindo que as regras de segurança verifiquem contra esta lista
 */
export const initializeAdminConfig = async (): Promise<void> => {
    try {
        console.log('Iniciando inicialização da configuração de administradores');
        console.log('Lista de administradores em authorized-emails.ts:', ADMIN_EMAILS);
        
        const configDoc = doc(FirebaseFirestore, ADMIN_CONFIG_COLLECTION, ADMIN_LIST_DOC);
        const docSnap = await getDoc(configDoc);
        
        console.log('Documento da configuração já existe?', docSnap.exists());
        
        if (!docSnap.exists()) {
            // Se o documento não existir, criamos com a lista atual de administradores
            await setDoc(configDoc, {
                adminEmails: ADMIN_EMAILS,
                lastUpdated: Timestamp.now()
            });
            console.log('Configuração de administradores inicializada com sucesso');
        } else {
            // Se já existir, atualizamos para garantir que está sincronizado com a lista atual
            const currentList = docSnap.data().adminEmails || [];
            console.log('Lista atual no Firestore:', currentList);
            
            const newAdmins = ADMIN_EMAILS.filter(email => !currentList.includes(email));
            console.log('Novos administradores a adicionar:', newAdmins);
            
            if (newAdmins.length > 0) {
                const updatedList = [...currentList, ...newAdmins];
                console.log('Lista atualizada:', updatedList);
                
                await setDoc(configDoc, {
                    adminEmails: updatedList,
                    lastUpdated: Timestamp.now()
                }, { merge: true });
                console.log('Lista de administradores atualizada com sucesso');
            } else {
                console.log('Nenhuma atualização necessária na lista de administradores');
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar configuração de administradores:', error);
        throw error;
    }
};

/**
 * Sincroniza a coleção admin_users com a lista de emails administradores
 * Garante que todos os administradores na lista tenham um documento correspondente
 */
export const syncAdminUsersCollection = async (): Promise<void> => {
    try {
        console.log('Iniciando sincronização da coleção admin_users');
        
        // Obter a lista atual de administradores
        const adminCollection = collection(FirebaseFirestore, ADMIN_COLLECTION);
        const adminSnapshot = await getDocs(adminCollection);
        const existingAdmins = adminSnapshot.docs.map(doc => doc.id);
        
        console.log('Administradores existentes na coleção:', existingAdmins);
        console.log('Administradores na lista de configuração:', ADMIN_EMAILS);
        
        // Identificar administradores que precisam ser adicionados
        const adminsToAdd = ADMIN_EMAILS.filter(email => !existingAdmins.includes(email));
        console.log('Administradores a serem adicionados:', adminsToAdd);
        
        if (adminsToAdd.length > 0) {
            console.log('Iniciando adição de novos administradores...');
            const batch = writeBatch(FirebaseFirestore);
            
            // Adicionar cada administrador ao batch
            adminsToAdd.forEach(email => {
                console.log('Preparando para adicionar admin:', email);
                const docRef = doc(FirebaseFirestore, ADMIN_COLLECTION, email);
                batch.set(docRef, {
                    email: email,
                    name: email.split('@')[0],
                    role: 'admin',
                    createdAt: Timestamp.now(),
                    isActive: true
                });
            });
            
            // Executar o batch
            try {
                await batch.commit();
                console.log(`${adminsToAdd.length} administradores adicionados com sucesso à coleção admin_users`);
            } catch (batchError) {
                console.error('Erro ao executar o batch:', batchError);
                throw batchError;
            }
        } else {
            console.log('Nenhum novo administrador para adicionar');
        }
        
        // Verificar se todos os administradores foram adicionados
        const verifySnapshot = await getDocs(adminCollection);
        console.log('Total de administradores após sincronização:', verifySnapshot.size);
    } catch (error) {
        console.error('Erro ao sincronizar coleção de administradores:', error);
        throw error;
    }
};

/**
 * Verifica se o usuário atual tem permissões de administrador
 * baseado na lista ADMIN_EMAILS
 */
export const checkAdminPermission = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Configura as regras de segurança do Firestore
 * Esta função é apenas para referência e deve ser implementada manualmente 
 * no console do Firebase
 */
export const getFirestoreSecurityRules = (): string => {
    return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função para verificar se o usuário é um administrador
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email in get(/databases/$(database)/documents/admin_config/admin_list).data.adminEmails;
    }
    
    // Regras para a coleção admin_users
    match /admin_users/{userId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Regras para configuração de administradores
    match /admin_config/{configId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
`;
};
