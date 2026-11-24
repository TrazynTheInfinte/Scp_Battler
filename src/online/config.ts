/**
 * The Firebase web config. Not a secret: it only names the project, and is
 * meant to ship in client code. Access is controlled by the Realtime Database
 * rules (database.rules.json) and Authentication's authorized domains.
 */
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyALTAsjRKkgkmKQ9josTJmahwl5fFAlt50',
  authDomain: 'scp-battler.firebaseapp.com',
  databaseURL: 'https://scp-battler-default-rtdb.firebaseio.com',
  projectId: 'scp-battler',
  storageBucket: 'scp-battler.firebasestorage.app',
  messagingSenderId: '430976007563',
  appId: '1:430976007563:web:415aadf73a1a9035a0c38e',
} as const
