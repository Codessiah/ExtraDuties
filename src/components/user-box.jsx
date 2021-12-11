import { createRef, useContext } from "react";
import judgeRole from "../utils/judge-role";
import SiteContext from "../utils/site-context";
import EmptyText from "./empty-text";
import InputBox from "./input-box";

export default function UserBox({ v, i, editing, setEditing, saveUserChanges, removeUser, rolesCache, userPromotion, copyPassword, searchMethod, eventsCache, settingsCache }) {
    let { userRole } = useContext(SiteContext);

    let inputBoxes = {
        username: createRef(),
        firstname: createRef(),
        lastname: createRef(),
        email: createRef()
    }

    let localRoleSearch = rolesCache.find(vv => vv.id === v.id);
    let localRole = judgeRole(localRoleSearch);
    let localReg = eventsCache.filter(vv => vv.data().assigned === v.id).length;

    function AdvBox({ name }) {
        return v.data()[name] === "" ? <EmptyText /> : <p title={v.data()[name]}>{v.data()[name]}</p>
    }

    if (searchMethod === "met_quota" && settingsCache.requiredJobs > localReg) return <></>
    if (searchMethod === "below_quota" && settingsCache.requiredJobs <= localReg) return <></>

    if (i === editing) return (
        <>
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="username" autoFocus />
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="firstname" />
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="lastname" />
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="email" />

            <div className="complete">{v.data().setup ? <img title="Complete" onDoubleClick={() => setEditing(i)} src="/icons/check-circle.svg" /> : <img onDoubleClick={() => setEditing(i)} title="Incomplete" src="/icons/exclamation-circle-fill.svg" />}</div>

            <p title={localReg}>{localReg}</p>

            <span>
                <button title="Save" onClick={() => saveUserChanges(inputBoxes)}><img src="/icons/check-circle.svg" /></button>
                <button title="Cancel" onClick={() => setEditing(-1)}><img src="/icons/x-circle-fill.svg" /></button>
            </span>

            <p />
        </>
    );

    if (editing > -1) return (
        <>
            <AdvBox name="username" />
            <AdvBox name="firstname" />
            <AdvBox name="lastname" />
            <AdvBox name="email" />

            <div className="complete">{v.data().setup ? <img title="Complete" src="/icons/check-circle.svg" /> : <img title="Incomplete" src="/icons/exclamation-circle-fill.svg" />}</div>

            <p title={localReg} onDoubleClick={() => setEditing(i)}>{localReg}</p>

            <p />
            <p />
        </>
    );

    return (
        <>
            <AdvBox name="username" />
            <AdvBox name="firstname" />
            <AdvBox name="lastname" />
            <AdvBox name="email" />

            <div className="complete">{v.data().setup ? <img title="Complete" src="/icons/check-circle.svg" /> : <img title="Incomplete" src="/icons/exclamation-circle-fill.svg" />}</div>

            <p title={localReg}>{localReg}</p>

            <span>
                {userRole > localRole ? (
                    <>
                        {!v.data().setup ? (
                            <>
                                <button title="Edit" onClick={() => setEditing(i)}><img src="/icons/gear-fill.svg" /></button>
                                <button title="Delete" onClick={() => removeUser(i)}><img src="/icons/trash-fill.svg" /></button>
                            </>
                        ) : (
                            <button title="Copy Password" onClick={() => copyPassword(i)}><img src="/icons/key-fill-gray.svg" /></button>
                        )}

                        {userRole > 1 && localRole === 0 && v.data().setup ? (
                            <button title="Promote" onClick={() => userPromotion(i)}><img src="/icons/arrow-up-circle-fill.svg" /></button>
                        ) : undefined}
                    </>
                ) : undefined}
            </span>

            <p />
        </>
    );
}