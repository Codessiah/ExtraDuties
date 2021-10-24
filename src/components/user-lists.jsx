import { useState } from 'react';
import Select from 'react-select';

export default function UserLists({ eventsCache, editing, usersCache, setUserSelect }) {
    let v = eventsCache[editing].data().assigned ? usersCache.find(v => v.id === eventsCache[editing].data().assigned) : undefined;
    let [val, setVal] = useState(v ? { value: v.id, label: v.data().firstname + " " + v.data().lastname } : undefined);

    setUserSelect(val ? val.value : undefined);

    let tlusers = usersCache.map(v => ({ value: v.id, label: v.data().firstname + " " + v.data().lastname }));

    const handleChange = (ch) => {
        setVal(ch);
        setUserSelect(ch ? ch.value : undefined);
    }

    return <Select
        isSearchable={true}
        isClearable={true}
        value={val}
        options={tlusers}
        onChange={handleChange}
        placeholder="Empty"
        className="rselect"
    />
}