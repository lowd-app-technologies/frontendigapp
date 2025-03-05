import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import FirebaseAuth from '@/services/firebase/FirebaseAuth';
import { ADMIN_EMAILS } from '@/configs/authorized-emails';

interface FirebaseAuthState {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  error: string | null;
}

/**
 * Hook personalizado para gerenciar autenticação do Firebase
 * Monitora o estado da autenticação e verifica se o usuário é um administrador
 */
export const useFirebaseAuth = (): FirebaseAuthState => {
  const [state, setState] = useState<FirebaseAuthState>({
    currentUser: null,
    loading: true,
    isAdmin: false,
    error: null
  });

  useEffect(() => {
    console.log('Firebase Auth - Estado inicial:', FirebaseAuth.currentUser);
    console.log('Admin Emails configurados:', ADMIN_EMAILS);
    
    // Inscreva-se para receber atualizações de estado de autenticação
    const unsubscribe = onAuthStateChanged(
      FirebaseAuth,
      (user) => {
        // Verifica se o usuário está autenticado e se é um administrador
        const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;
        
        console.log('Firebase Auth - Usuário autenticado:', user?.email);
        console.log('Firebase Auth - É admin?', isAdmin);
        
        setState({
          currentUser: user,
          loading: false,
          isAdmin,
          error: null
        });
      },
      (error) => {
        console.error('Firebase Auth - Erro:', error);
        setState({
          currentUser: null,
          loading: false,
          isAdmin: false,
          error: error.message
        });
      }
    );

    // Limpeza ao desmontar
    return () => unsubscribe();
  }, []);

  return state;
};

export default useFirebaseAuth;
