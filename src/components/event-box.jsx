import { createRef } from "react";
import InputBox from "./input-box";
import date from 'date-and-time';
import EmptyText from "./empty-text";
import moment from "moment";

export default function EventBox({ v, i, editing, setEditing, usersCache, saveEventChanges, removeEvent, searchMethod }) {
    let inputBoxes = {
        category: createRef(),
        description: createRef(),
        job: createRef(),
        date: createRef(),
        start: createRef(),
        end: createRef(),
        assigned: createRef()
    }

    let localAssigned = usersCache.find(vv => vv.id === v.data().assigned);
    let localFullname = localAssigned ? localAssigned.data().firstname + " " + localAssigned.data().lastname : undefined;

    let localStart = v.data().start.toDate();
    let localEnd = v.data().end.toDate();

    let now = moment();
    let tstart = moment(localStart);

    if (searchMethod === "coming_up" && tstart < now) return <></>
    if (searchMethod === "taken" && !v.data().assigned) return <></>
    if (searchMethod === "empty" && v.data().assigned) return <></>
    if (searchMethod === "this_week" && now.isoWeek() !== tstart.isoWeek()) return <></>

    function AdvBox({ name }) {
        return v.data()[name] === "" ? <EmptyText /> : <p title={v.data()[name]} onDoubleClick={() => setEditing(i)}>{v.data()[name]}</p>
    }

    if (i === editing) return (
        <>
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="category" autoFocus />
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="description" />
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="job" />
            <InputBox v={v} inputBoxes={inputBoxes} type="date" name="date" />
            <InputBox v={v} inputBoxes={inputBoxes} type="time" name="start" />
            <InputBox v={v} inputBoxes={inputBoxes} type="time" name="end" />

            <p />

            <span>
                <button title="Save" onClick={() => saveEventChanges(inputBoxes)}><img src="/icons/check-circle.svg" /></button>
                <button title="Cancel" onClick={() => setEditing(-1)}><img src="/icons/x-circle-fill.svg" /></button>
            </span>

            <p />
        </>
    );

    if (editing > -1) return (
        <>
            <AdvBox name="category" />
            <AdvBox name="description" />
            <AdvBox name="job" />

            <p title={date.format(localStart, "MM/DD/YYYY")} onDoubleClick={() => setEditing(i)}>{date.format(localStart, "MM/DD/YYYY")}</p>

            <p title={date.format(localStart, "h:mm A")} onDoubleClick={() => setEditing(i)}><p><p>{date.format(localStart, "h:mm")}</p><p style={{ fontWeight: "bold", marginLeft: 5 }}>{date.format(localStart, "A")}</p></p></p>
            <p title={date.format(localEnd, "h:mm A")} onDoubleClick={() => setEditing(i)}><p><p>{date.format(localEnd, "h:mm")}</p><p style={{ fontWeight: "bold", marginLeft: 5 }}>{date.format(localEnd, "A")}</p></p></p>

            {localFullname ? <p title={localFullname} onDoubleClick={() => setEditing(i)}>{localFullname}</p> : <EmptyText />}

            <p />
            <p />
        </>
    )

    return (
        <>
            <AdvBox name="category" />
            <AdvBox name="description" />
            <AdvBox name="job" />

            <p title={date.format(localStart, "MM/DD/YYYY")} onDoubleClick={() => setEditing(i)}>{date.format(localStart, "MM/DD/YYYY")}</p>

            <p title={date.format(localStart, "h:mm A")} onDoubleClick={() => setEditing(i)}><p><p>{date.format(localStart, "h:mm")}</p><p style={{ fontWeight: "bold", marginLeft: 5 }}>{date.format(localStart, "A")}</p></p></p>
            <p title={date.format(localEnd, "h:mm A")} onDoubleClick={() => setEditing(i)}><p><p>{date.format(localEnd, "h:mm")}</p><p style={{ fontWeight: "bold", marginLeft: 5 }}>{date.format(localEnd, "A")}</p></p></p>

            {localFullname ? <p title={localFullname} onDoubleClick={() => setEditing(i)}>{localFullname}</p> : <EmptyText />}

            <span>
                <button title="Edit" onClick={() => setEditing(i)}><img src="/icons/gear-fill.svg" /></button>
                <button title="Delete" onClick={() => removeEvent(i)}><img src="/icons/trash-fill.svg" /></button>
            </span>

            <p />
        </>
    )
}