import { useState } from 'react';
import Select from 'react-select';

export default function ComboBox({ onMenuSelect }) {
    let [val, setVal] = useState({ value: "all", label: "All" });

    const handleChange = (v) => {
        setVal(v);
        onMenuSelect(v);
    }

    return <Select
        isSearchable={false}
        value={val}
        options={[
            { value: "all", label: "All" },
            { value: "mine", label: "Mine" },
            { value: "empty", label: "Empty" },
        ]}
        className="rselect"
        onChange={handleChange}
    />
}