// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdmthk8af6NewzoaYEJvwP3SUj5U9Udj4",
  authDomain: "knowledgekrazequiz.firebaseapp.com",
  projectId: "knowledgekrazequiz",
  storageBucket: "knowledgekrazequiz.appspot.com",
  messagingSenderId: "764224912172",
  appId: "1:764224912172:web:8cf3dee0de36cd5b1eca89",
  measurementId: "G-Q0R8GDXGV1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export const analytics = getAnalytics(app);
export default app;

