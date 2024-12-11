// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import firebaseConfig from './firebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Set auth persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
  console.log('App is online');
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('App is offline');
});

let analytics;
if (process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
  logEvent(analytics, 'notification_received');
}

export { app, db, auth, analytics, isOnline };