import { useContext } from "react";
import SiteContext from "../utils/site-context";
import EmptyText from "./empty-text";
import date from 'date-and-time';

export default function UserEventBox({ v, i, usersCache, takeEvent, cancelEvent, searchMethod, settingsCache, localReg }) {
    let { user } = useContext(SiteContext);
    let localAssigned = usersCache.find(vv => vv.id === v.data().assigned);
    let localFullname = localAssigned ? localAssigned.data().firstname + " " + localAssigned.data().lastname : undefined;

    let localStart = v.data().start.toDate();
    let localEnd = v.data().end.toDate();

    if (searchMethod === "mine" && v.data().assigned !== user.uid) return <></>;
    if (searchMethod === "empty" && localAssigned) return <></>;

    function AdvBox({ name }) {
        return v.data()[name] === "" ? <EmptyText /> : <p title={v.data()[name]}>{v.data()[name]}</p>
    }

    return (
        <>
            <AdvBox name="category" />
            <AdvBox name="description" />
            <AdvBox name="job" />

            <p title={date.format(localStart, "MM/DD/YYYY")}>{date.format(localStart, "MM/DD/YYYY")}</p>

            <p title={date.format(localStart, "h:mm A")}><p><p>{date.format(localStart, "h:mm")}</p><p style={{ fontWeight: "bold", marginLeft: 5 }}>{date.format(localStart, "A")}</p></p></p>
            <p title={date.format(localEnd, "h:mm A")}><p><p>{date.format(localEnd, "h:mm")}</p><p style={{ fontWeight: "bold", marginLeft: 5 }}>{date.format(localEnd, "A")}</p></p></p>

            <div className="assigned">
                {localFullname ? <p title={localFullname}>{localFullname}</p> : undefined}

                {localFullname ? localAssigned.id === user.uid ? (
                    <button className="cancel" onClick={() => cancelEvent(i)}>Cancel</button>
                ) : undefined(
                    <button className="take" onClick={() => takeEvent(i)}>Take</button>
                ) : undefined}
            </div>

            <p />
        </>
    );
}