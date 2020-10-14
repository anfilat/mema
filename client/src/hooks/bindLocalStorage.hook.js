import {useState} from 'react';

export function useBindLocalStorage(varName, initialValue) {
    const data = JSON.parse(localStorage.getItem(varName));

    const [value, setValue] = useState(data && data.value ? data.value : initialValue);

    function handler(val) {
        setValue(val);

        localStorage.setItem(varName, JSON.stringify({
            value: val,
        }));
    }

    return [value, handler];
}
