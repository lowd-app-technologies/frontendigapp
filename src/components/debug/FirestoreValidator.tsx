import React, { useEffect, useState } from 'react';
import FirebaseFirestore from '@/services/firebase/FirebaseFirestore';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { addAuthorizedEmail } from '@/services/AuthorizationService';
import { Card, Alert } from '@/components/ui';

const COLLECTION_NAME = 'authorized_emails';

const FirestoreValidator: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Validando conexão com Firestore...');
  const [docCount, setDocCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const validateFirestore = async () => {
      try {
        // Teste de conexão com o Firestore
        const collectionRef = collection(FirebaseFirestore, COLLECTION_NAME);
        
        try {
          // Tenta obter documentos da collection
          const querySnapshot = await getDocs(collectionRef);
          
          setStatus('success');
          setMessage(`Conexão com Firestore estabelecida! Collection '${COLLECTION_NAME}' acessível.`);
          setDocCount(querySnapshot.size);
        } catch (collectionError: any) {
          setStatus('error');
          setError(`Erro ao acessar collection: ${collectionError.message}`);
          setMessage(`Conexão estabelecida, mas a collection '${COLLECTION_NAME}' não pôde ser acessada.`);
        }
      } catch (error: any) {
        setStatus('error');
        setError(`Erro: ${error.message}`);
        setMessage('Falha ao conectar com o Firestore.');
      }
    };

    validateFirestore();
  }, []);

  // Função para testar a adição de email diretamente
  const testAddEmail = async () => {
    setStatus('loading');
    setMessage('Testando adição de email...');
    
    const testEmail = `test-${new Date().getTime()}@example.com`;
    
    try {
      // Tentativa direta com o Firestore
      const COLLECTION_NAME = 'authorized_emails';
      const docRef = doc(FirebaseFirestore, COLLECTION_NAME, testEmail);
      
      console.log('Tentando adicionar email diretamente via Firestore:', testEmail);
      
      try {
        await setDoc(docRef, {
          email: testEmail,
          createdAt: new Date()
        });
        
        setStatus('success');
        setMessage(`Email adicionado com sucesso diretamente via Firestore: ${testEmail}`);
      } catch (directError: any) {
        console.error('Erro ao adicionar diretamente:', directError);
        setError(`Erro ao adicionar diretamente: ${directError.message}`);
        
        // Testar usando a função do serviço
        try {
          console.log('Tentando adicionar email via serviço:', testEmail);
          const success = await addAuthorizedEmail(testEmail);
          
          if (success) {
            setStatus('success');
            setMessage(`Email adicionado com sucesso via serviço: ${testEmail}`);
          } else {
            setStatus('error');
            setMessage('Falha ao adicionar email via serviço, mas sem erro lançado');
          }
        } catch (serviceError: any) {
          setStatus('error');
          setError(`Erro ao adicionar via serviço: ${serviceError.message}`);
          setMessage('Falha ao adicionar email via serviço');
        }
      }
    } catch (error: any) {
      setStatus('error');
      setError(`Erro: ${error.message}`);
      setMessage('Falha ao testar adição de email');
    }
  };

  return (
    <Card className="p-4 max-w-2xl mx-auto mt-8">
      <h3 className="mb-4">Validação do Firestore</h3>
      
      <div className="mb-4">
        <button 
          onClick={testAddEmail}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Testar Adição de Email
        </button>
      </div>
      
      {status === 'loading' && (
        <Alert type="info" showIcon className="mb-4">
          {message}
        </Alert>
      )}
      
      {status === 'success' && (
        <>
          <Alert type="success" showIcon className="mb-4">
            {message}
          </Alert>
          <div className="mt-4">
            <p><strong>Collection:</strong> {COLLECTION_NAME}</p>
            <p><strong>Documentos encontrados:</strong> {docCount}</p>
          </div>
        </>
      )}
      
      {status === 'error' && (
        <>
          <Alert type="danger" showIcon className="mb-4">
            {message}
          </Alert>
          <div className="mt-4 p-3 bg-gray-100 rounded-md overflow-auto">
            <code className="text-red-500">{error}</code>
          </div>
        </>
      )}
    </Card>
  );
};

export default FirestoreValidator;
