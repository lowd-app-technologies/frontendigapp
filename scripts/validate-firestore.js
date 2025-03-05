// Script para validar a conexão com o Firestore e verificar se a collection existe
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente
// Tenta carregar diferentes arquivos .env em ordem de prioridade
let envLoaded = false;

if (dotenv.config({ path: '.env.validate' }).parsed) {
  console.log('Usando configurações de .env.validate');
  envLoaded = true;
} else if (dotenv.config({ path: '.env.local' }).parsed) {
  console.log('Usando configurações de .env.local');
  envLoaded = true;
} else if (dotenv.config({ path: '.env' }).parsed) {
  console.log('Usando configurações de .env');
  envLoaded = true;
}

if (!envLoaded) {
  console.log('AVISO: Nenhum arquivo .env foi carregado!');
}

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const COLLECTION_NAME = 'authorized_emails';

async function validateFirestore() {
  try {
    console.log('Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    
    console.log('Conectando ao Firestore...');
    const db = getFirestore(app);
    
    console.log(`Verificando a collection '${COLLECTION_NAME}'...`);
    const collectionRef = collection(db, COLLECTION_NAME);
    
    try {
      // Tenta obter os documentos da collection
      const querySnapshot = await getDocs(collectionRef);
      
      console.log('✅ Conexão com o Firestore estabelecida com sucesso!');
      console.log(`✅ Collection '${COLLECTION_NAME}' existe e está acessível.`);
      console.log(`📊 A collection '${COLLECTION_NAME}' possui ${querySnapshot.size} documentos.`);
      
      if (querySnapshot.size > 0) {
        console.log('\nPrimeiros 5 documentos na collection:');
        let count = 0;
        querySnapshot.forEach((doc) => {
          if (count < 5) {
            console.log(`- ID: ${doc.id}, Email: ${doc.data().email}`);
            count++;
          }
        });
      }
    } catch (error) {
      console.log('✅ Conexão com o Firestore estabelecida.');
      console.log(`❌ ERRO ao acessar a collection '${COLLECTION_NAME}': ${error.message}`);
      console.log('A collection pode não existir ou você pode não ter permissões para acessá-la.');
    }
  } catch (error) {
    console.log(`❌ ERRO ao conectar com o Firebase: ${error.message}`);
    console.log('Verifique suas credenciais e conexão com a internet.');
  }
}

validateFirestore();

