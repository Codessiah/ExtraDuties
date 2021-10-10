import { useContext } from "react";
import SiteContext from "../utils/site-context";

export default function UserEventBox({ v, i, usersCache, takeEvent, cancelEvent, searchMethod }) {
    let { user } = useContext(SiteContext);
    let localAssigned = usersCache.find(vv => vv.id === v.data().assigned);
    let localFullname = localAssigned ? localAssigned.data().firstname + " " + localAssigned.data().lastname : undefined;

    if (!v.data()) return <></>;
    if (searchMethod === "mine" && v.data().assigned !== user.uid) return <></>;
    if (searchMethod === "empty" && localAssigned) return <></>;

    return (
        <>
            <div><p title={v.data().category} >{v.data().category}</p></div>
            <div><p title={v.data().description} >{v.data().description}</p></div>
            <div><p title={v.data().job} >{v.data().job}</p></div>
            <div><p title={v.data().start.toDate().toLocaleDateString()} >{v.data().start.toDate().toLocaleDateString()}</p></div>
            <div><p title={v.data().start.toDate().toLocaleTimeString()} >{v.data().start.toDate().toLocaleTimeString()}</p></div>
            <div><p title={v.data().end.toDate().toLocaleTimeString()} >{v.data().end.toDate().toLocaleTimeString()}</p></div>

            <div className="assigned">
                <p title={localFullname}>{localFullname}</p>

                {localFullname ? localAssigned.id === user.uid ? (
                    <button className="cancel" onClick={() => cancelEvent(i)}>CANCEL</button>
                ) : undefined : (
                    <button className="take" onClick={() => takeEvent(i)}>TAKE</button>
                )}
            </div>
        </>
    );
}