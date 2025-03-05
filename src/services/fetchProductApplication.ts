import { getDatabase, ref, get, child } from 'firebase/database'
import FirebaseConfig from '@/configs/firebase.config'
import { initializeApp } from 'firebase/app'

// Inicialize o Firebase
const app = initializeApp(FirebaseConfig)
const db = getDatabase(app)

const fetchProductApplication = async () => {
    const dbRef = ref(db)
    try {
        const snapshot = await get(child(dbRef, 'produtos'))
        if (snapshot.exists()) {
            const produtos = snapshot.val()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const aplicacoes = produtos.map((produto: any) => produto.APLICACAO)
            console.log(aplicacoes)
            return aplicacoes
        } else {
            console.log('Nenhum dado disponível')
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error)
    }
}

export default fetchProductApplication