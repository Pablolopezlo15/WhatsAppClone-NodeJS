// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBF5Jj4WTOt5w_0WnBXFAWiYb6S9wr3aOU",
  authDomain: "pokeapi-react-c2918.firebaseapp.com",
  projectId: "pokeapi-react-c2918",
  storageBucket: "pokeapi-react-c2918.appspot.com",
  messagingSenderId: "1066237226293",
  appId: "1:1066237226293:web:5f2a74f1365da2a095f07c",
  measurementId: "G-4JW0F97FGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;