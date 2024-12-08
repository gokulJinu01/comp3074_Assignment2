


// firebase/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBP6pAELrN-FuE6Q1ZOnKOCZl0MJpo3dw8",
  authDomain: "tictactoe-79809.firebaseapp.com",
  projectId: "tictactoe-79809",
  storageBucket: "tictactoe-79809.appspot.com",
  messagingSenderId: "186500096833",
  appId: "1:186500096833:web:71ae917a40d24e8ed6f7c0",
  databaseURL: "https://tictactoe-79809-default-rtdb.firebaseio.com/"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
