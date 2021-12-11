import { useState } from 'react';
import Select from 'react-select';

export default function ComboBox({ onMenuSelect, menus }) {
    let m = menus.map(v => v.toLowerCase().split(" ").join("_"));

    let [val, setVal] = useState({ value: m[0], label: menus[0] });

    const handleChange = (v) => {
        setVal(v);
        onMenuSelect(v);
    }

    const customStyles = {
        menu: (provided) => ({
            ...provided,
            width: "150px"
        })
    }

    return <Select
        isSearchable={false}
        value={val}
        options={menus.map((v, i) => ({ value: m[i], label: v }))}
        styles={customStyles}
        className="cselect"
        onChange={handleChange}
    />
}