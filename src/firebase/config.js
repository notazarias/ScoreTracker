// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDx7Yhk51HvTf9wjNZ2fEdTablMDixYsSc",
  authDomain: "score-tracker-71bf9.firebaseapp.com",
  projectId: "score-tracker-71bf9",
  storageBucket: "score-tracker-71bf9.firebasestorage.app",
  messagingSenderId: "983810295070",
  appId: "1:983810295070:web:03ecd76b1f039e4d69b50f",
  measurementId: "G-Z53DJCGWCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);