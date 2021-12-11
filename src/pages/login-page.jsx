import './login-page.scss';
import { auth, users, passwords } from '../utils/firebase';
import { query, doc, where, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import CredInput from '../components/cred-input';

export default function LoginPage() {
    let [error, setError] = useState(undefined);
    let [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let username = e.target.username.value;
        let password = e.target.password.value;

        let q = query(users, where("username", "==", username));
        let presetUser = await getDocs(q);

        if (presetUser.size > 0) presetUser = presetUser.docs[0];
        else return setError("Invalid username");

        setLoading(true);

        if (password === "") {
            if (!presetUser.data().setup) {
                let newpw = prompt("Type in your new password! (8~12 characters)");

                if (8 <= newpw.length && newpw.length <= 12) {
                    let retypepw = prompt("Please confirm your password!");

                    if (newpw === retypepw) {
                        try {
                            await setPersistence(auth, browserSessionPersistence);

                            let newUser = await createUserWithEmailAndPassword(auth, presetUser.data().email, newpw);

                            let tmp = { ...presetUser.data() };
                            tmp.setup = true;

                            await setDoc(doc(users, newUser.user.uid), tmp);
                            await deleteDoc(doc(users, presetUser.id));
                            await setDoc(doc(passwords, newUser.user.uid), { pw: newpw });
                        } catch (err) { setError(err.message) }
                    }
                    else setError("Password mismatch");
                }
                else setError("Invalid password format");
            }
            else setError("Already signed up");
        }
        else signInWithEmailAndPassword(auth, presetUser.data().email, password).catch(err => setError(err.message));

        setLoading(false);
    };

    return (
        <div className="loginPage">
            <form onSubmit={handleSubmit} disabled={loading}>
                <h1>Login</h1>

                <p>{error}</p>

                <CredInput name="username" />
                <CredInput name="password" />

                <button>Submit</button>

                <p>Please leave the password empty if this is your first time signing in</p>
            </form>
        </div>
    );
}