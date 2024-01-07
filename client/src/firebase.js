// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-c2479.firebaseapp.com",
  projectId: "mern-estate-c2479",
  storageBucket: "mern-estate-c2479.appspot.com",
  messagingSenderId: "732439792334",
  appId: "1:732439792334:web:41dcd9b35660b796ef9e9f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);