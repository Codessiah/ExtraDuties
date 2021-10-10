import './App.scss';

// Packages
import { auth, users, roles } from './utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import SiteContext from './utils/site-context';
import UtilRoute from './utils/util-route';

// Pages
import LoginPage from './pages/login-page';
import ConsolePage from './pages/console-page';
import UnknownPage from './pages/unknown-page';
import judgeRole from './utils/judge-role';

export default function App() {
    let [user, setUser] = useState(undefined);
    let [userData, setUserData] = useState(undefined);
    let [userRole, setUserRole] = useState(undefined);

    useEffect(() => {
        let unsub = onAuthStateChanged(auth, u => u ? loginUser(u) : logoutUser());
        return () => unsub();
    }, []);

    const loginUser = async (u) => {
        let userDataDoc = await getDoc(doc(users, u.uid));
        let userRoleDoc = await getDoc(doc(roles, u.uid));

        setUserRole(judgeRole(userRoleDoc));

        document.title = `Welcome, ${userDataDoc.data().firstname}!`;

        setUser(u);
        setUserData(userDataDoc.data());
    };

    const logoutUser = () => {
        setUser(undefined);
        setUserData(undefined);
        setUserRole(undefined);
    }

    return (
        <SiteContext.Provider value={{ user, userData, userRole }}>
            <BrowserRouter>
                <Switch>
                    <UtilRoute exact unauthed path="/" redirect="/console" component={LoginPage} />
                    <UtilRoute exact authed path="/console" redirect="/" component={ConsolePage} />
                    <UnknownPage />
                </Switch>
            </BrowserRouter>
        </SiteContext.Provider>
    );
}