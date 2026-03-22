import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDVssjkzwuQf6V3OqfwzPdDuiZUZhy3uQs",
  authDomain: "baby-shower-invite-f93ae.firebaseapp.com",
  projectId: "baby-shower-invite-f93ae",
  storageBucket: "baby-shower-invite-f93ae.firebasestorage.app",
  messagingSenderId: "982028594002",
  appId: "1:982028594002:web:87e4c21c6a1d44d2ef688b"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db, app };