import { signOut, updateEmail, updatePassword } from '@firebase/auth';
import { auth, events, roles, users, settings, passwords } from '../utils/firebase';
import { createRef, useContext, useEffect, useState, createElement } from 'react';
import SiteContext from '../utils/site-context';
import './console-page.scss';
import { addDoc, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where } from '@firebase/firestore';
import EventBox from '../components/event-box';
import Papa from 'papaparse';
import date from 'date-and-time';
import UserBox from '../components/user-box';
import UserEventBox from '../components/user-event-box';
import ComboBox from '../components/combo-box';
import { CSVLink } from 'react-csv';
import UserLists from '../components/user-lists';
import Nav from '../components/navigator';
import MenuList from '../utils/menu-list';
import moment from 'moment';

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
    let [settingsCache, setSettingsCache] = useState([]);
    let [editing, setEditing] = useState(-1);
    let [loading, setLoading] = useState(undefined);
    let fileRef = createRef();
    let { user, userData } = useContext(SiteContext);
    let [eventsCsvReport, setEventsCsvReport] = useState({ data: [], headers: [], filename: "", v: true });
    let [usersCsvReport, setUsersCsvReport] = useState({ data: [], headers: [], filename: "", v: true });
    let EventsCsvDownloader = createRef();
    let UsersCsvDownloader = createRef();
    let [userSelect, setUserSelect] = useState(undefined);
    let [searchMethod, setSearchMethod] = useState("all");

    useEffect(() => loadData(), []);
    useEffect(() => generateCsv(), [eventsCache, usersCache, searchMethod]);

    let menu = MenuList();

    const loadData = async () => {
        onSnapshot(query(events, orderBy("start")), (qs) => setEventsCache(qs.docs));
        onSnapshot(query(users), orderBy("lastname"), (qs) => setUsersCache(qs.docs));
        onSnapshot(query(roles), (qs) => setRolesCache(qs.docs));
        onSnapshot(query(settings), (qs) => setSettingsCache(qs.docs[0].data()));
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

            // TODO format check
            let pstart = date.parse(sstart, "HH:mm");
            let pend = date.parse(send, "HH:mm");

            start.setHours(pstart.getHours());
            start.setMinutes(pstart.getMinutes());

            end.setHours(pend.getHours());
            end.setMinutes(pend.getMinutes());

            let uid = assigned !== "" ? usersCache.find(v => v.data().username === assigned || v.data().firstname + " " + v.data().lastname === assigned) : undefined;

            if (uid) uid = uid.id;

            await addDoc(events, { category, description, job, start, end, assigned: uid ?? null });
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
        let q = confirm("Are you sure you want to promote this user?");
        if (!q) return;

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
        let visibleEvents = eventsCache.filter(v => {
            let now = moment();
            let tstart = moment(v.data().start.toDate());

            if (searchMethod === "coming_up" && tstart < now) return false;
            if (searchMethod === "taken" && !v.data().assigned) return false;
            if (searchMethod === "empty" && v.data().assigned) return false;
            if (searchMethod === "this_week" && now.isoWeek() !== tstart.isoWeek()) return false;

            return true;
        });

        let eventsCsv = {
            data: visibleEvents.map(v => {
                let localAssigned = usersCache.find(vv => vv.id === v.data().assigned);

                return {
                    category: v.data().category,
                    description: v.data().description,
                    job: v.data().job,
                    date: date.format(v.data().start.toDate(), "MM/DD/YYYY"),
                    start: date.format(v.data().start.toDate(), "HH:mm"),
                    end: date.format(v.data().end.toDate(), "HH:mm"),
                    assigned: localAssigned ? localAssigned.data().username : null
                }
            }),
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
            data: usersCache.map(v => ({
                username: v.data().username,
                firstname: v.data().firstname,
                lastname: v.data().lastname,
                email: v.data().email,
                setup: v.data().setup ? "Y" : "N",
                reg: eventsCache.filter(vv => vv.data().assigned === v.id).length
            })),
            headers: [
                { label: "Username", key: "username" },
                { label: "Firstname", key: "firstname" },
                { label: "Lastname", key: "lastname" },
                { label: "Email", key: "email" },
                { label: "Setup", key: "setup" },
                { label: "Registered", key: "reg" }
            ],
            filename: `Extra Duties Users Report: ${date.format(new Date(), "MM/DD/YYYY")}.csv`
        }

        setEventsCsvReport(eventsCsv);
        setUsersCsvReport(usersCsv);
    }

    const copyPassword = async (index) => {
        let uid = usersCache[index].id;
        let pw = await getDoc(doc(passwords, uid));

        navigator.clipboard.writeText(pw.data().pw);
        alert("Copied password to clipboard!");
    }

    const toValidISOString = (d) => {
        let nd = date.format(d, "YYYY-MM-DDThh:mm");
        return nd;
    }

    const saveSettings = (e) => {
        e.preventDefault();

        let opening = date.parse(e.target.opening.value, "YYYY-MM-DDThh:mm");
        let requiredJobs = Number(e.target.requiredJobs.value);

        setDoc(doc(settings, "current"), { opening, requiredJobs }).then(() => alert("Successful!"));
    }

    const onMenuSelect = (v) => {
        setSearchMethod(v.value);
    }

    // Loading
    if (!eventsCache || !usersCache || !rolesCache || !settingsCache) return <></>

    return (
        <div className="consolePage admin">
            <input type="file" hidden ref={fileRef} onChange={fileUploadInputChange} accept=".csv,.csvx" />

            <CSVLink {...eventsCsvReport} ref={EventsCsvDownloader} />
            <CSVLink {...usersCsvReport} ref={UsersCsvDownloader} />

            <Nav {...{ tab, setTab, setEditing, setSearchMethod }} signOut={() => signOut(auth)} />

            {loading ? (
                <div className="overlay">
                    <p>{loading}</p>
                </div>
            ) : undefined}

            <div>
                <div>
                    <h1 className="title">{menu[tab]}</h1>

                    {tab === 0 ? (
                        <div className="events">
                            <ComboBox onMenuSelect={onMenuSelect} menus={["All", "Coming Up", "Taken", "Empty", "This Week"]} />

                            {editing > -1 ? (
                                <UserLists eventsCache={eventsCache} editing={editing} usersCache={usersCache} setUserSelect={setUserSelect} />
                            ) : undefined}

                            <div className="container">
                                {eventsCache.length > 0 ? (
                                    <div className="filled">
                                        <p className="header">Category</p>
                                        <p className="header">Description</p>
                                        <p className="header">Job</p>
                                        <p className="header">Date</p>
                                        <p className="header">Start</p>
                                        <p className="header">End</p>
                                        <p className="header">Assigned</p>
                                        <p className="header">Actions</p>
                                        <p className="header" />

                                        {eventsCache.map((v, i) => <EventBox {...{ v, i, editing, setEditing, usersCache, saveEventChanges, removeEvent, searchMethod }} />)}
                                    </div>
                                ) : (
                                    <div className="empty">
                                        Seems empty...
                                    </div>
                                )}
                            </div>

                            <div className="options">
                                <button onClick={addNewEvent} title="Add new event" ><img src="/icons/plus.svg" /></button>
                                <button onClick={clearAllEvent} title="Clear all events"><img src="/icons/trash2.svg" /></button>

                                <button onClick={fileUploadAction} title="Upload events spreadsheet" ><img src="/icons/file-earmark-arrow-up.svg" /></button>

                                <button onClick={() => EventsCsvDownloader.current.link.click()} title="Download events report"><img src="/icons/download.svg" /></button>
                            </div>
                        </div>
                    ) : tab === 1 ? (
                        <div className="users">
                            <ComboBox onMenuSelect={onMenuSelect} menus={["All", "Met Quota", "Below Quota"]} />

                            <div className="container">
                                {usersCache && usersCache.length > 0 ? (
                                    <div className="filled">
                                        <p className="header">Username</p>
                                        <p className="header">First Name</p>
                                        <p className="header">Last Name</p>
                                        <p className="header">Email</p>
                                        <p className="header">Setup</p>
                                        <p className="header">Registered</p>
                                        <p className="header">Actions</p>
                                        <p />

                                        {usersCache.map((v, i) => <UserBox {...{ v, i, editing, setEditing, saveUserChanges, removeUser, rolesCache, userPromotion, copyPassword, searchMethod, eventsCache, settingsCache }} />)}
                                    </div>
                                ) : (
                                    <div className="empty">
                                        Seems empty...
                                    </div>
                                )}
                            </div>

                            <div className="options">
                                <button onClick={addNewUser} title="Add new user" ><img src="/icons/plus.svg" /></button>
                                <button onClick={clearAllUser} title="Remove all users"><img src="/icons/trash2.svg" /></button>

                                <button onClick={fileUploadAction} title="Upload users spreadsheet" ><img src="/icons/file-earmark-arrow-up.svg" /></button>

                                <button onClick={() => UsersCsvDownloader.current.link.click()} title="Download users report"><img src="/icons/download.svg" /></button>
                            </div>
                        </div>
                    ) : tab === 2 ? (
                        <div className="profile">
                            <div>
                                <form onSubmit={newNames}>
                                    <div>
                                        <label>First Name</label>
                                        <input key="first" name="first" placeholder="First Name" defaultValue={userData.firstname} />
                                    </div>

                                    <div>
                                        <label>Last Name</label>
                                        <input key="last" name="last" placeholder="Last Name" defaultValue={userData.lastname} />
                                    </div>

                                    <button>Save</button>
                                </form>

                                <div>
                                    <button onClick={changeEmail}>Change Email</button>
                                    <button onClick={changePassword}>Change Password</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="settings">
                            <div>
                                <form onSubmit={saveSettings}>
                                    <div>
                                        <label>Opening Timestamp</label>
                                        <input key="opening" type="datetime-local" name="opening" defaultValue={toValidISOString(settingsCache.opening.toDate())} />
                                    </div>

                                    <div>
                                        <label>Required Jobs</label>
                                        <input key="required" type="number" name="requiredJobs" min="0" defaultValue={settingsCache.requiredJobs} />
                                    </div>

                                    <button>Save</button>
                                </form>
                            </div>
                        </div>
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
    let [settingsCache, setSettingsCache] = useState(undefined);
    let [searchMethod, setSearchMethod] = useState("all"); // all, mine, empty

    useEffect(() => loadData(), []);

    let menu = MenuList();
    let localReg = eventsCache.filter(v => v.data().assigned === user.uid).length;

    const loadData = async () => {
        onSnapshot(query(events, orderBy("start"), where("start", ">=", new Date())), (qs) => setEventsCache(qs.docs));
        onSnapshot(query(users), orderBy("lastname"), (qs) => setUsersCache(qs.docs));
        onSnapshot(query(settings), (qs) => setSettingsCache(qs.docs[0].data()));
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

    if (!usersCache || !eventsCache || !settingsCache) return <></>

    return (
        <div className="consolePage user">
            <Nav {...{ tab, setTab, setSearchMethod }} signOut={() => signOut(auth)} />

            <div>
                <div>
                    <h1 className="title">{menu[tab]}</h1>

                    {tab === 0 ? (
                        <div className="events">
                            <ComboBox onMenuSelect={onMenuSelect} menus={["All", "Mine", "Empty"]} />

                            <div className="container">
                                {eventsCache.length > 0 ? (
                                    <>
                                        <div className="filled">
                                            <p className="header">Category</p>
                                            <p className="header">Description</p>
                                            <p className="header">Job</p>
                                            <p className="header">Date</p>
                                            <p className="header">Start</p>
                                            <p className="header">End</p>
                                            <p className="header">Assigned</p>
                                            <p className="header" />

                                            {eventsCache.map((v, i) => <UserEventBox {...{ v, i, usersCache, takeEvent, cancelEvent, searchMethod, localReg, settingsCache }} />)}
                                        </div>
                                    </>
                                ) : settingsCache.opening.toDate() <= new Date() ? (
                                    <div className="empty">
                                        Seems empty...
                                    </div>
                                ) : (
                                    <div className="empty">
                                        Sign up window is currently closed! Opening on {date.format(settingsCache.opening.toDate(), "MMMM D, YYYY at h:mm A")}
                                    </div>
                                )}
                            </div>
                        </div>

                    ) : (
                        <div className="profile">
                            <div>
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

                                <div>
                                    <button onClick={changeEmail}>Change Email</button>
                                    <button onClick={changePassword}>Change Password</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}