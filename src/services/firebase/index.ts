import FirebaseApp from './FirebaseApp'
import FirebaseAuth from './FirebaseAuth'
import FirebaseDB from './FirebaseDB'
import { signInWithFirebaseGoogle } from './FirebaseGoogleAuth'

export {
    FirebaseApp,
    FirebaseAuth,
    FirebaseDB,
    signInWithFirebaseGoogle
}

export default {
    app: FirebaseApp,
    auth: FirebaseAuth,
    db: FirebaseDB
}
