import React, { useState } from 'react';
import { Button, Input, Card, Alert } from '@/components/ui';
import FirebaseFirestore from '@/services/firebase/FirebaseFirestore';
import { 
    doc, 
    setDoc, 
    collection, 
    getDocs,
    Timestamp,
    serverTimestamp,
    writeBatch 
} from 'firebase/firestore';
import { addAuthorizedEmail } from '@/services/AuthorizationService';

const COLLECTION_NAME = 'authorized_emails';

type TestResult = {
    name: string;
    success: boolean;
    message: string;
    error?: string;
    timestamp: Date;
};

const FirestoreErrorDiagnostic: React.FC = () => {
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [testEmail, setTestEmail] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [configInfo, setConfigInfo] = useState<Record<string, string>>({});

    // Adiciona um resultado de teste
    const addResult = (name: string, success: boolean, message: string, error?: string) => {
        setTestResults(prev => [
            {
                name,
                success,
                message,
                error,
                timestamp: new Date()
            },
            ...prev
        ]);
    };

    // Carrega informações de configuração
    const loadConfigInfo = () => {
        const info: Record<string, string> = {};
        
        // Verifica as variáveis de ambiente
        info['FIREBASE_PROJECT_ID'] = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Não definido';
        info['FIREBASE_API_KEY'] = import.meta.env.VITE_FIREBASE_API_KEY ? 'Definido' : 'Não definido';
        info['FIREBASE_AUTH_DOMAIN'] = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'Não definido';

        // Verifica o Firestore
        info['FIRESTORE_INSTANCE'] = FirebaseFirestore ? 'Inicializado' : 'Falha';
        
        setConfigInfo(info);
    };

    // Executa testes específicos do Firestore
    const runDiagnostics = async () => {
        setIsRunning(true);
        setTestResults([]);
        loadConfigInfo();

        const testEmailValue = testEmail || `test-${new Date().getTime()}@example.com`;
        
        try {
            // Teste 1: Verificar conexão básica com o Firestore
            try {
                const collectionRef = collection(FirebaseFirestore, COLLECTION_NAME);
                await getDocs(collectionRef);
                addResult(
                    'Conexão com Firestore', 
                    true, 
                    'Conexão com Firestore estabelecida com sucesso.'
                );
            } catch (error: any) {
                addResult(
                    'Conexão com Firestore', 
                    false, 
                    'Falha ao conectar com o Firestore.', 
                    error.message
                );
                // Se falhar na conexão básica, não execute os outros testes
                setIsRunning(false);
                return;
            }

            // Teste 2: Verificar se a collection existe
            try {
                const collectionRef = collection(FirebaseFirestore, COLLECTION_NAME);
                const snapshot = await getDocs(collectionRef);
                
                addResult(
                    'Verificação da Collection', 
                    true, 
                    `Collection '${COLLECTION_NAME}' existe. Documentos encontrados: ${snapshot.size}`
                );
            } catch (error: any) {
                addResult(
                    'Verificação da Collection', 
                    false, 
                    `Falha ao acessar a collection '${COLLECTION_NAME}'.`, 
                    error.message
                );
            }

            // Teste 3: Tentativa direta de escrita no Firestore
            try {
                const docRef = doc(FirebaseFirestore, COLLECTION_NAME, testEmailValue);
                await setDoc(docRef, {
                    email: testEmailValue,
                    createdAt: serverTimestamp()
                });
                
                addResult(
                    'Escrita Direta no Firestore', 
                    true, 
                    `Email '${testEmailValue}' adicionado com sucesso via setDoc direto.`
                );
            } catch (error: any) {
                addResult(
                    'Escrita Direta no Firestore', 
                    false, 
                    `Falha ao adicionar email '${testEmailValue}' diretamente.`, 
                    error.message
                );
            }

            // Teste 4: Tentativa via serviço de autorização
            try {
                const success = await addAuthorizedEmail(testEmailValue);
                
                if (success) {
                    addResult(
                        'Adição via Serviço de Autorização', 
                        true, 
                        `Email '${testEmailValue}' adicionado com sucesso via serviço.`
                    );
                } else {
                    addResult(
                        'Adição via Serviço de Autorização', 
                        false, 
                        `Falha ao adicionar email '${testEmailValue}' via serviço (retornou false).`
                    );
                }
            } catch (error: any) {
                addResult(
                    'Adição via Serviço de Autorização', 
                    false, 
                    `Exceção ao adicionar email '${testEmailValue}' via serviço.`, 
                    error.message
                );
            }

            // Teste 5: Tentativa com batch write
            try {
                const batch = writeBatch(FirebaseFirestore);
                const testBatchEmail = `batch-${new Date().getTime()}@example.com`;
                const docRef = doc(FirebaseFirestore, COLLECTION_NAME, testBatchEmail);
                
                batch.set(docRef, {
                    email: testBatchEmail,
                    createdAt: Timestamp.now()
                });
                
                await batch.commit();
                
                addResult(
                    'Escrita em Lote (Batch)', 
                    true, 
                    `Email '${testBatchEmail}' adicionado com sucesso via batch.`
                );
            } catch (error: any) {
                addResult(
                    'Escrita em Lote (Batch)', 
                    false, 
                    'Falha ao adicionar email usando writeBatch.', 
                    error.message
                );
            }

        } catch (error: any) {
            addResult(
                'Diagnóstico Geral', 
                false, 
                'Erro inesperado durante os testes.', 
                error.message
            );
        } finally {
            setIsRunning(false);
        }
    };
    
    return (
        <Card className="p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Diagnóstico de Erros do Firestore</h2>
            
            <div className="mb-6">
                <div className="mb-4">
                    <Input
                        placeholder="Email de teste (opcional)"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        disabled={isRunning}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Se não fornecer um email, um email de teste aleatório será usado.
                    </p>
                </div>
                
                <Button
                    variant="solid"
                    onClick={runDiagnostics}
                    loading={isRunning}
                    disabled={isRunning}
                    className="w-full"
                >
                    Executar Diagnóstico Completo
                </Button>
            </div>
            
            {Object.keys(configInfo).length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Informações de Configuração:</h3>
                    <ul className="text-sm space-y-1">
                        {Object.entries(configInfo).map(([key, value]) => (
                            <li key={key}>
                                <span className="font-mono">{key}:</span> {value}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {testResults.length > 0 && (
                <div>
                    <h3 className="font-medium mb-3">Resultados dos Testes:</h3>
                    <div className="space-y-3">
                        {testResults.map((result, index) => (
                            <div 
                                key={index} 
                                className={`p-3 rounded-lg ${
                                    result.success ? 'bg-green-50' : 'bg-red-50'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium">
                                            {result.success ? '✅ ' : '❌ '}
                                            {result.name}
                                        </h4>
                                        <p className="text-sm my-1">{result.message}</p>
                                        {result.error && (
                                            <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto text-red-600">
                                                {result.error}
                                            </pre>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {result.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default FirestoreErrorDiagnostic;
