import { FIREBASE_CONFIG } from './config'

/**
 * Firebase, loaded on first use only: single-player never downloads the SDK.
 * Everything that talks to Firebase goes through this.
 */
export type Firebase = Awaited<ReturnType<typeof load>>

async function load() {
  const [app, auth, database] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/database'),
  ])
  const instance = app.initializeApp(FIREBASE_CONFIG)
  return { auth: auth.getAuth(instance), db: database.getDatabase(instance), authApi: auth, dbApi: database }
}

let loading: Promise<Firebase> | null = null

export function loadFirebase(): Promise<Firebase> {
  loading ??= load().catch((e: unknown) => {
    loading = null // let a later attempt retry (e.g. the chunk failed to download)
    throw e
  })
  return loading
}
