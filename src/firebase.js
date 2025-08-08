// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMc7fGQs6qplw3ms-erx6pQzarN8hs1JU",
  authDomain: "paysync-f57c8.firebaseapp.com",
  projectId: "paysync-f57c8",
  storageBucket: "paysync-f57c8.firebasestorage.app",
  messagingSenderId: "1068311691221",
  appId: "1:1068311691221:web:362671d612bbf6aa79875c",
  measurementId: "G-T3XXHFNYEY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)
export {app,auth};