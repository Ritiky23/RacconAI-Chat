// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCv1ZNxAjRwGouxOjHkdBpGKCblIvt1tS4",
  authDomain: "racconai-94939.firebaseapp.com",
  projectId: "racconai-94939",
  storageBucket: "racconai-94939.appspot.com",
  messagingSenderId: "835645160842",
  appId: "1:835645160842:web:7b41b24fdcabf9925ddc73",
  measurementId: "G-7S2CFEE97W"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
