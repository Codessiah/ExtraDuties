import { createRef, useState } from "react";
import InputBox from "./input-box";

export default function EventBox({ v, i, editing, setEditing, usersCache, saveEventChanges, removeAssigned, removeEvent }) {
    let inputBoxes = {
        category: createRef(),
        description: createRef(),
        job: createRef(),
        date: createRef(),
        start: createRef(),
        end: createRef()
    }

    let localAssigned = usersCache.find(vv => vv.id === v.data().assigned);
    let localFullname = localAssigned ? localAssigned.data().firstname + " " + localAssigned.data().lastname : undefined;

    if (!v.data()) return <p></p>;

    if (i === editing) return (
        <>
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="category" />
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="description" />
            <InputBox v={v} inputBoxes={inputBoxes} type="text" name="job" />
            <InputBox v={v} inputBoxes={inputBoxes} type="date" name="date" />
            <InputBox v={v} inputBoxes={inputBoxes} type="time" name="start" />
            <InputBox v={v} inputBoxes={inputBoxes} type="time" name="end" />

            <div>
                {localFullname ? (
                    <>
                        <p>{localFullname}</p>

                        <button title="Reset" onClick={removeAssigned}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-x-fill" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.146-2.854a.5.5 0 0 1 .708 0L14 6.293l1.146-1.147a.5.5 0 0 1 .708.708L14.707 7l1.147 1.146a.5.5 0 0 1-.708.708L14 7.707l-1.146 1.147a.5.5 0 0 1-.708-.708L13.293 7l-1.147-1.146a.5.5 0 0 1 0-.708z" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <p>EMPTY</p>
                )}
            </div>

            <div className="actions">
                <button title="Save" onClick={() => saveEventChanges(inputBoxes)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                        <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                    </svg>
                </button>

                <button title="Cancel" onClick={() => setEditing(-1)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                </button>
            </div>
        </>
    );

    if (editing > -1) return (
        <>
            <div><p title={v.data().category}>{v.data().category}</p></div>
            <div><p title={v.data().description}>{v.data().description}</p></div>
            <div><p title={v.data().job}>{v.data().job}</p></div>
            <div><p title={v.data().start.toDate().toLocaleDateString()} onDoubleClick={() => setEditing(i)}>{v.data().start.toDate().toLocaleDateString()}</p></div>
            <div><p title={v.data().start.toDate().toLocaleTimeString()} onDoubleClick={() => setEditing(i)}>{v.data().start.toDate().toLocaleTimeString()}</p></div>
            <div><p title={v.data().end.toDate().toLocaleTimeString()} onDoubleClick={() => setEditing(i)}>{v.data().end.toDate().toLocaleTimeString()}</p></div>
            <div><p title={localFullname ?? "EMPTY"}>{localFullname ?? "EMPTY"}</p></div>
            <div></div>
        </>
    )

    return (
        <>
            <div><p title={v.data().category} onDoubleClick={() => setEditing(i)}>{v.data().category}</p></div>
            <div><p title={v.data().description} onDoubleClick={() => setEditing(i)}>{v.data().description}</p></div>
            <div><p title={v.data().job} onDoubleClick={() => setEditing(i)}>{v.data().job}</p></div>
            <div><p title={v.data().start.toDate().toLocaleDateString()} onDoubleClick={() => setEditing(i)}>{v.data().start.toDate().toLocaleDateString()}</p></div>
            <div><p title={v.data().start.toDate().toLocaleTimeString()} onDoubleClick={() => setEditing(i)}>{v.data().start.toDate().toLocaleTimeString()}</p></div>
            <div><p title={v.data().end.toDate().toLocaleTimeString()} onDoubleClick={() => setEditing(i)}>{v.data().end.toDate().toLocaleTimeString()}</p></div>
            <div><p title={localFullname ?? "EMPTY"} onDoubleClick={() => setEditing(i)}>{localFullname ?? "EMPTY"}</p></div>

            <div className="actions">
                <button title="Edit" onClick={() => setEditing(i)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-gear-fill" viewBox="0 0 16 16">
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                    </svg>
                </button>

                <button title="Delete" onClick={() => removeEvent(i)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" className="bi bi-trash-fill" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                    </svg>
                </button>
            </div>
        </>
    )
}