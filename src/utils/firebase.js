import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDs1cgOV_3fHgQzHpxjU0dLJ5UOUu5f0bk",
    authDomain: "extra-duties.firebaseapp.com",
    projectId: "extra-duties",
    storageBucket: "extra-duties.appspot.com",
    messagingSenderId: "600260284146",
    appId: "1:600260284146:web:7367a4a68c2dbdc57bca6b"
};

const fapp = initializeApp(firebaseConfig);
const firestore = getFirestore(fapp);
const auth = getAuth(fapp);

const users = collection(firestore, "users");
const roles = collection(firestore, "roles");
const events = collection(firestore, "events");
const settings = collection(firestore, "settings");
const passwords = collection(firestore, "passwords");

export { auth, users, roles, events, settings, passwords };
