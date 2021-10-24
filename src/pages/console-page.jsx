import { signOut, updateEmail, updatePassword } from '@firebase/auth';
import { auth, events, roles, users, settings, passwords } from '../utils/firebase';
import { createRef, useContext, useEffect, useState, createElement } from 'react';
import SiteContext from '../utils/site-context';
import './console-page.scss';
import { addDoc, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc } from '@firebase/firestore';
import EventBox from '../components/event-box';
import Papa from 'papaparse';
import date from 'date-and-time';
import UserBox from '../components/user-box';
import UserEventBox from '../components/user-event-box';
import ComboBox from '../components/combo-box';
import { CSVLink } from 'react-csv';
import UserLists from '../components/user-lists';

export default function ConsolePage() {
    let { userRole } = useContext(SiteContext);

    if (userRole > 0) return <AdminConsole />;
    return <UserConsole />;
}

function AdminConsole() {
    let [tab, setTab] = useState(0);
    let [eventsCache, setEventsCache] = useState([]);
    let [usersCache, setUsersCache] = useState([]);
    let [rolesCache, setRolesCache] = useState([]);
    let [editing, setEditing] = useState(-1);
    let [loading, setLoading] = useState(undefined);
    let fileRef = createRef();
    let { user, userData } = useContext(SiteContext);
    let [eventsCsvReport, setEventsCsvReport] = useState({ data: [], headers: [], filename: "", v: true });
    let [usersCsvReport, setUsersCsvReport] = useState({ data: [], headers: [], filename: "", v: true });
    let EventsCsvDownloader = createRef();
    let UsersCsvDownloader = createRef();
    let [userSelect, setUserSelect] = useState(undefined);

    useEffect(() => loadData(), []);
    useEffect(() => setEditing(-1), [tab]);
    useEffect(() => generateCsv(), [eventsCache, usersCache]);

    const loadData = async () => {
        onSnapshot(query(events, orderBy("start")), (qs) => setEventsCache(qs.docs));
        onSnapshot(query(users), orderBy("lastname"), (qs) => setUsersCache(qs.docs));
        onSnapshot(query(roles), (qs) => setRolesCache(qs.docs));
    }

    const saveEventChanges = (inputBoxes) => {
        let category = inputBoxes.category.current.value;
        let description = inputBoxes.description.current.value;
        let job = inputBoxes.job.current.value;

        let start = date.parse(inputBoxes.date.current.value, "YYYY-MM-DD");
        let end = date.parse(inputBoxes.date.current.value, "YYYY-MM-DD");

        let pstart = date.parse(inputBoxes.start.current.value, "hh:mm");
        let pend = date.parse(inputBoxes.end.current.value, "hh:mm");

        start.setHours(pstart.getHours());
        start.setMinutes(pstart.getMinutes());

        end.setHours(pend.getHours());
        end.setMinutes(pend.getMinutes());

        updateDoc(doc(events, eventsCache[editing].id), { category, description, job, start, end, assigned: userSelect ?? null });
        setEditing(-1);
    }

    const removeEvent = (index) => {
        deleteDoc(doc(events, eventsCache[index].id));
        setEditing(-1);
    }

    const addNewEvent = () => {
        addDoc(events, {
            category: "",
            description: "",
            job: "",
            start: new Date(),
            end: new Date(),
            assigned: null
        });
    }

    const fbClearEvents = async () => {
        setLoading("Preparing removal...");
        setEditing(-1);

        let eventsDocs = await getDocs(query(events));

        for (let i in eventsDocs.docs) {
            setLoading(`Removed (${i}/${eventsDocs.size})`);
            await deleteDoc(doc(events, eventsDocs.docs[i].id));
        }

        setLoading(undefined);
    }

    const clearAllEvent = async (e) => {
        if (!e.shiftKey) {
            let ans = confirm("Are you sure about removing all events?");
            if (!ans) return;
        }

        fbClearEvents();
    }

    const addEvent = async (data) => {
        for (let i in data) {
            setLoading(`Added (${i}/${data.length})`);
            let v = data[i];

            let category = v["category"] ?? v["Category"];
            let description = v["description"] ?? v["Description"];
            let job = v["job"] ?? v["Job"];
            let sdate = v["date"] ?? v["Date"];
            let sstart = v["start"] ?? v["Start"];
            let send = v["end"] ?? v["End"];
            let assigned = v["staff"] ?? v["Staff"] ?? v["assigned"] ?? v["Assigned"];

            if (!category || !description || !job || !date || !sstart || !send) continue;

            let start = new Date(sdate);
            let end = new Date(sdate);

            let pstart = date.parse(sstart, "HH:mm:ss");
            let pend = date.parse(send, "HH:mm:ss");

            start.setHours(pstart.getHours());
            start.setMinutes(pstart.getMinutes());

            end.setHours(pend.getHours());
            end.setMinutes(pend.getMinutes());

            let uid = assigned ? usersCache.find(v => v.data().username === assigned || v.data().firstname + " " + v.data().lastname === assigned) : undefined;

            await addDoc(events, { category, description, job, start, end, assigned: uid.id ?? null });
        }

        setLoading(undefined);
    }

    const saveUserChanges = (inputBoxes) => {
        let username = inputBoxes.username.current.value;
        let firstname = inputBoxes.firstname.current.value;
        let lastname = inputBoxes.lastname.current.value;
        let email = inputBoxes.email.current.value;

        if (email !== usersCache[editing].data().email && usersCache.find(v => v.data().email === email)) {
            alert("Account with the same email exists!");
            return;
        }

        updateDoc(doc(users, usersCache[editing].id), { username, firstname, lastname, email });
        setEditing(-1);
    }

    const removeUser = (index) => {
        deleteDoc(doc(users, usersCache[index].id));
        setEditing(-1);
    }

    const userPromotion = (index) => {
        setDoc(doc(roles, usersCache[index].id), { isAdmin: true, isSuperAdmin: false });
    }

    const addNewUser = () => {
        addDoc(users, {
            username: String(Math.floor(Math.random() * 900000) + 100000),
            firstname: "",
            lastname: "",
            email: "",
            setup: false
        });
    }

    const fbClearUser = async () => {
        setLoading("Preparing removal...");

        let usersDocs = await getDocs(query(users));

        let useful = usersDocs.docs.filter(v => v.data().setup);
        let filtered = usersDocs.docs.filter(v => !v.data().setup);

        for (let i in filtered) {
            setLoading(`Removed (${i}/${filtered.length})`);
            await deleteDoc(doc(users, filtered[i].id));
        }

        setLoading(undefined);
        return useful;
    }

    const clearAllUser = async (e) => {
        if (!e.shiftKey) {
            let ans = confirm("Are you sure about removing all users?");
            if (!ans) return;
        }

        fbClearUser();
    }

    const addUser = async (data) => {
        let leftover = await fbClearUser();

        for (let i in data) {
            setLoading(`Added (${i}/${data.length})`);
            let v = data[i];

            let username = v["username"] ?? v["Username"];
            let firstname = v["firstname"] ?? v["Firstname"] ?? v["first name"] ?? v["First name"] ?? v["First Name"];
            let lastname = v["lastname"] ?? v["Lastname"] ?? v["last name"] ?? v["Last name"] ?? v["Last Name"];
            let email = v["email"] ?? v["Email"];

            if (!username || !firstname || !lastname || !email) continue;
            if (leftover.find(v => v.data().email === email || v.data().username === username)) continue;

            await addDoc(users, { username, firstname, lastname, email, setup: false });
        }

        setLoading(undefined);
    }

    const fileUploadAction = () => fileRef.current.click();
    const fileUploadInputChange = (e) => {
        let filePath = e.target.files[0];

        Papa.parse(filePath, {
            complete: (csvfile) => {
                switch (tab) {
                    case 0: addEvent(csvfile.data); break;
                    case 1: addUser(csvfile.data); break;
                }
            },
            header: true
        });
    }

    const changeEmail = () => {
        let email = prompt("Please type in your new email.");
        if (email) updateEmail(auth.currentUser, email)
            .then(() => alert("Successful!"))
            .catch(err => alert(err.message));
    }

    const changePassword = () => {
        let pw = prompt("Please type in your new password.");
        if (pw) updatePassword(auth.currentUser, pw)
            .then(() => {
                setDoc(doc(passwords, user.uid), { pw });
                alert("Successful!");
            })
            .catch(err => alert(err.message));
    }

    const newNames = (e) => {
        e.preventDefault();

        let firstname = e.target.first.value;
        let lastname = e.target.last.value;

        updateDoc(doc(users, user.uid), { firstname, lastname })
            .then(() => alert("Successful!"))
            .catch(err => alert(err.message));
    }

    const generateCsv = () => {
        let eventsCsv = {
            data: eventsCache.map(v => new Object({
                category: v.data().category,
                description: v.data().description,
                job: v.data().job,
                date: date.format(v.data().start.toDate(), "MM/DD/YYYY"),
                start: date.format(v.data().start.toDate(), "HH:mm:ss"),
                end: date.format(v.data().end.toDate(), "HH:mm:ss"),
                assigned: v.data().assigned,
            })),
            headers: [
                { label: "Category", key: "category" },
                { label: "Description", key: "description" },
                { label: "Job", key: "job" },
                { label: "Date", key: "date" },
                { label: "Start", key: "start" },
                { label: "End", key: "end" },
                { label: "Assigned", key: "assigned" },
            ],
            filename: `Extra Duties Events Report: ${date.format(new Date(), "MM/DD/YYYY")}.csv`
        }

        let usersCsv = {
            data: usersCache.map(v => new Object({
                username: v.data().username,
                firstname: v.data().firstname,
                lastname: v.data().lastname,
                email: v.data().email,
                setup: v.data().setup ? "Y" : "N"
            })),
            headers: [
                { label: "Username", key: "username" },
                { label: "Firstname", key: "firstname" },
                { label: "Lastname", key: "lastname" },
                { label: "Email", key: "email" },
                { label: "Setup", key: "setup" },
            ],
            filename: `Extra Duties Users Report: ${date.format(new Date(), "MM/DD/YYYY")}.csv`
        }

        setEventsCsvReport(eventsCsv);
        setUsersCsvReport(usersCsv);
    }

    const copyPassword = async (index) => {
        let uid = usersCache[index].id;
        let pw = await getDoc(doc(passwords, uid));

        console.log(uid);
        navigator.clipboard.writeText(pw.data().pw);
        alert("Copied password to clipboard!");
    }

    const optionsSize = 40;

    return (
        <div className="consolePage admin">
            <input type="file" hidden ref={fileRef} onChange={fileUploadInputChange} accept=".csv,.csvx" />

            <CSVLink {...eventsCsvReport} ref={EventsCsvDownloader} />
            <CSVLink {...usersCsvReport} ref={UsersCsvDownloader} />

            <nav>
                <div className={tab === 0 ? "selected" : ""} onClick={() => setTab(0)}>Events</div>
                <div className={tab === 1 ? "selected" : ""} onClick={() => setTab(1)}>Users</div>
                <div className={tab === 2 ? "selected" : ""} onClick={() => setTab(2)}>Profile</div>
                <div className={tab === 3 ? "selected" : ""} onClick={() => setTab(3)}>Settings</div>
                <div onClick={() => signOut(auth)}>Sign Out</div>
            </nav>

            {
                loading ? (
                    <div className="overlay">
                        <p>{loading}</p>
                    </div>
                ) : undefined
            }

            <div>
                <div>
                    {tab === 0 ? (
                        <>
                            <h1 className="title">Events</h1>

                            <div className="events">
                                {editing > -1 ? (
                                    <UserLists eventsCache={eventsCache} editing={editing} usersCache={usersCache} setUserSelect={setUserSelect} />
                                ) : undefined}

                                {eventsCache && eventsCache.length > 0 ? (
                                    <div className="yes">
                                        <div className="header" title="Category"><p>Category</p></div>
                                        <div className="header" title="Description"><p>Description</p></div>
                                        <div className="header" title="Job"><p>Job</p></div>
                                        <div className="header" title="Date"><p>Date</p></div>
                                        <div className="header" title="Start"><p>Start</p></div>
                                        <div className="header" title="End"><p>End</p></div>
                                        <div className="header" title="Assigned"><p>Assigned</p></div>
                                        <div className="header" title="Actions"><p>Actions</p></div>

                                        {eventsCache.map((v, i) => <EventBox v={v} i={i} editing={editing} setEditing={setEditing} usersCache={usersCache} saveEventChanges={saveEventChanges} removeEvent={removeEvent} />)}
                                    </div>
                                ) : (
                                    <div className="no">
                                        Seems empty...
                                    </div>
                                )}

                                <div className="options">
                                    <button onClick={addNewEvent} title="Add new event" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width={optionsSize} height={optionsSize} fill="rgb(232, 83, 51)" class="bi bi-plus" viewBox="0 0 16 16">
                                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                        </svg>
                                    </button>

                                    <button onClick={clearAllEvent} title="Clear all events">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={optionsSize} height={optionsSize} fill="rgb(232, 83, 51)" className="bi bi-trash2" viewBox="0 0 16 16">
                                            <path d="M14 3a.702.702 0 0 1-.037.225l-1.684 10.104A2 2 0 0 1 10.305 15H5.694a2 2 0 0 1-1.973-1.671L2.037 3.225A.703.703 0 0 1 2 3c0-1.105 2.686-2 6-2s6 .895 6 2zM3.215 4.207l1.493 8.957a1 1 0 0 0 .986.836h4.612a1 1 0 0 0 .986-.836l1.493-8.957C11.69 4.689 9.954 5 8 5c-1.954 0-3.69-.311-4.785-.793z" />
                                        </svg>
                                    </button>

                                    <button onClick={fileUploadAction} title="Upload events spreadsheet" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width={optionsSize} height={optionsSize} fill="rgb(232, 83, 51)" class="bi bi-file-earmark-arrow-up" viewBox="0 0 16 16">
                                            <path d="M8.5 11.5a.5.5 0 0 1-1 0V7.707L6.354 8.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 7.707V11.5z" />
                                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                                        </svg>
                                    </button>

                                    <button onClick={() => EventsCsvDownloader.current.link.click()} title="Download events report">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={optionsSize} height={optionsSize} fill="rgb(232, 83, 51)" className="bi bi-download" viewBox="0 0 16 16">
                                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : tab === 1 ? (
                        <>
                            <h1 className="title">Users</h1>

                            <div className="users">
                                {usersCache && usersCache.length > 0 ? (
                                    <div className="yes">
                                        <div className="header" title="Username">Username</div>
                                        <div className="header" title="First Name">First Name</div>
                                        <div className="header" title="Last Name">Last Name</div>
                                        <div className="header" title="Email">Email</div>
                                        <div className="header" title="Role">Setup</div>
                                        <div className="header" title="Role">Actions</div>

                                        {usersCache.map((v, i) => <UserBox v={v} i={i} editing={editing} setEditing={setEditing} saveUserChanges={saveUserChanges} removeUser={removeUser} rolesCache={rolesCache} userPromotion={userPromotion} copyPassword={copyPassword} />)}
                                    </div>
                                ) : (
                                    <div className="no">
                                        Seems empty...
                                    </div>
                                )}

                                <div className="options">
                                    <button onClick={addNewUser} title="Add new user" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width={optionsSize} height={optionsSize} fill="rgb(232, 83, 51)" class="bi bi-plus" viewBox="0 0 16 16">
                                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                        </svg>
                                    </button>

                                    <button onClick={clearAllUser} title="Clear all users">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={optionsSize} height={optionsSize} fill="rgb(232, 83, 51)" className="bi bi-trash2" viewBox="0 0 16 16">
                                            <path d="M14 3a.702.702 0 0 1-.037.225l-1.684 10.104A2 2 0 0 1 10.305 15H5.694a2 2 0 0 1-1.973-1.671L2.037 3.225A.703.703 0 0 1 2 3c0-1.105 2.686-2 6-2s6 .895 6 2zM3.215 4.207l1.493 8.957a1 1 0 0 0 .986.836h4.612a1 1 0 0 0 .986-.836l1.493-8.957C11.69 4.689 9.954 5 8 5c-1.954 0-3.69-.311-4.785-.793z" />
                                        </svg>
                                    </button>

                                    <button onClick={fileUploadAction} title="Upload users spreadsheet" >
                                        <svg xmlns="http://www.w3.org/2000/svg" width={optionsSize} height={optionsSize} fill="rgb(232, 83, 51)" class="bi bi-file-earmark-arrow-up" viewBox="0 0 16 16">
                                            <path d="M8.5 11.5a.5.5 0 0 1-1 0V7.707L6.354 8.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 7.707V11.5z" />
                                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
                                        </svg>
                                    </button>

                                    <button onClick={() => UsersCsvDownloader.current.link.click()} title="Download users list">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={optionsSize} height={optionsSize} fill="rgb(232, 83, 51)" className="bi bi-download" viewBox="0 0 16 16">
                                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : tab === 2 ? (
                        <>
                            <h1 className="title">Profile</h1>

                            <div className="profile">
                                <form onSubmit={newNames}>
                                    <div>
                                        <label>First Name</label>
                                        <input name="first" placeholder="First Name" defaultValue={userData.firstname} />
                                    </div>

                                    <div>
                                        <label>Last Name</label>
                                        <input name="last" placeholder="Last Name" defaultValue={userData.lastname} />
                                    </div>

                                    <button>Save</button>
                                </form>

                                <button onClick={changeEmail}>Change Email</button>
                                <button onClick={changePassword}>Change Password</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 className="title">Settings</h1>

                            <div className="settings">
                                <form></form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}

function UserConsole() {
    let [tab, setTab] = useState(0);
    let { user, userData } = useContext(SiteContext);
    let [eventsCache, setEventsCache] = useState([]);
    let [usersCache, setUsersCache] = useState([]);
    let [searchMethod, setSearchMethod] = useState("all"); // all, mine, empty

    useEffect(() => loadData(), []);

    const loadData = async () => {
        let eventsDoc = await getDocs(query(events, orderBy("start")));
        setEventsCache(eventsDoc.docs);

        let usersDoc = await getDocs(query(users), orderBy("lastname"));
        setUsersCache(usersDoc.docs);

        onSnapshot(query(events, orderBy("start")), (qs) => setEventsCache(qs.docs));
        onSnapshot(query(users), orderBy("lastname"), (qs) => setUsersCache(qs.docs));
    }

    const changeEmail = () => {
        let email = prompt("Please type in your new email.");
        if (email) updateEmail(auth.currentUser, email)
            .then(() => alert("Successful!"))
            .catch(err => alert(err.message));
    }

    const changePassword = () => {
        let pw = prompt("Please type in your new password.");
        if (pw) updatePassword(auth.currentUser, pw)
            .then(() => {
                setDoc(doc(passwords, user.uid), { pw });
                alert("Successful!");
            })
            .catch(err => alert(err.message));
    }

    const newNames = (e) => {
        e.preventDefault();

        let firstname = e.target.first.value;
        let lastname = e.target.last.value;

        updateDoc(doc(users, user.uid), { firstname, lastname })
            .then(() => alert("Successful!"))
            .catch(err => alert(err.message));
    }

    const takeEvent = (index) => {
        updateDoc(doc(events, eventsCache[index].id), { assigned: user.uid });
    }

    const cancelEvent = (index) => {
        updateDoc(doc(events, eventsCache[index].id), { assigned: null });
    }

    const onMenuSelect = (v) => {
        setSearchMethod(v.value);
    }

    return (
        <div className="consolePage user">
            <nav>
                <div className={tab === 0 ? "selected" : ""} onClick={() => setTab(0)}>Events</div>
                <div className={tab === 1 ? "selected" : ""} onClick={() => setTab(1)}>Profile</div>
                <div onClick={() => signOut(auth)}>Sign Out</div>
            </nav>

            <div>
                <div>
                    {tab === 0 ? (
                        <>
                            <h1 className="title">Events</h1>

                            <div className="events">
                                {eventsCache && eventsCache.length > 0 ? (
                                    <>
                                        <ComboBox onMenuSelect={onMenuSelect} />

                                        <div className="yes">
                                            <div className="header" title="Category"><p>Category</p></div>
                                            <div className="header" title="Description"><p>Description</p></div>
                                            <div className="header" title="Job"><p>Job</p></div>
                                            <div className="header" title="Date"><p>Date</p></div>
                                            <div className="header" title="Start"><p>Start</p></div>
                                            <div className="header" title="End"><p>End</p></div>
                                            <div className="header" title="Assigned"><p>Assigned</p></div>

                                            {eventsCache.map((v, i) => <UserEventBox v={v} i={i} usersCache={usersCache} takeEvent={takeEvent} cancelEvent={cancelEvent} searchMethod={searchMethod} />)}
                                        </div>
                                    </>

                                ) : (
                                    <div className="no">
                                        Seems empty...
                                    </div>
                                )}
                            </div>
                        </>

                    ) : (
                        <>
                            <h1 className="title">Profile</h1>

                            <div className="profile">
                                <form onSubmit={newNames}>
                                    <div>
                                        <label>First Name</label>
                                        <input name="first" defaultValue={userData.firstname} />
                                    </div>

                                    <div>
                                        <label>Last Name</label>
                                        <input name="last" defaultValue={userData.lastname} />
                                    </div>

                                    <button>Save</button>
                                </form>

                                <button onClick={changeEmail}>Change Email</button>
                                <button onClick={changePassword}>Change Password</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}