import admin from 'firebase-admin';

let app;
if (!admin.apps?.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  if (projectId && clientEmail && privateKey) {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Fallback to application default credentials if provided (e.g., GOOGLE_APPLICATION_CREDENTIALS)
    app = admin.initializeApp();
  }
}

export const firebaseAuth = admin.auth();
