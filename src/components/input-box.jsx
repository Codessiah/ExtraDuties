import date from 'date-and-time';

export default function InputBox({ v, inputBoxes, type, name }) {
    if (type === "text") return <input defaultValue={v.data()[name]} name={name} type="text" ref={inputBoxes[name]} />

    let rawtime = new Date(v.data()["start"].toDate().toISOString());

    let dateValue = date.format(rawtime, "YYYY-MM-DD");
    let timeValue = date.format(rawtime, "hh:mm");

    if (type === "date") return <input defaultValue={dateValue} name={name} type="date" ref={inputBoxes[name]} />

    if (type === "time") return <input defaultValue={timeValue} name={name} type="time" ref={inputBoxes[name]} />

    return <input />
}