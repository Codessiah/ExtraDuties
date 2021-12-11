import date from 'date-and-time';

export default function InputBox({ v, inputBoxes, type, name, autoFocus }) {
    if (type === "text") return <div><input defaultValue={v.data()[name]} name={name} type="text" ref={inputBoxes[name]} autoFocus={autoFocus} /></div>

    let localStart = v.data().start.toDate();
    let localEnd = v.data().end.toDate();

    let dateValue = date.format(localStart, "YYYY-MM-DD");
    let timeValue = date.format(name === "end" ? localEnd : localStart, "HH:mm");

    if (type === "date") return <div><input defaultValue={dateValue} name={name} type="date" ref={inputBoxes[name]} /></div>

    if (type === "time") return <div><input defaultValue={timeValue} name={name} type="time" ref={inputBoxes[name]} /></div>

    return <input />
}