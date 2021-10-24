import date from 'date-and-time';

export default function InputBox({ v, inputBoxes, type, name }) {
    if (type === "text") return <input defaultValue={v.data()[name]} name={name} type="text" ref={inputBoxes[name]} />

    let localStart = v.data().start.toDate();
    let localEnd = v.data().end.toDate();

    let dateValue = date.format(localStart, "YYYY-MM-DD");
    let timeValue = date.format(name === "end" ? localEnd : localStart, "HH:mm");

    if (type === "date") return <input defaultValue={dateValue} name={name} type="date" ref={inputBoxes[name]} />

    if (type === "time") return <input defaultValue={timeValue} name={name} type="time" ref={inputBoxes[name]} />

    return <input />
}