import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxM3782PutAEXn9iQEjC4Cc__DFDboi0M",
  authDomain: "ghana-phama-inventory.firebaseapp.com",
  projectId: "ghana-phama-inventory",
  storageBucket: "ghana-phama-inventory.firebasestorage.app",
  messagingSenderId: "953749510794",
  appId: "1:953749510794:web:70964a99835d0e13ddab73",
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
