import {useState} from 'react';

export function useBindLocalStorage(formName, varName, initialValue) {
    const data = JSON.parse(localStorage.getItem(formName));

    const [value, setValue] = useState(data && data[varName] ? data[varName] : initialValue);

    function changeHandler(val) {
        setValue(val);

        localStorage.setItem(formName, JSON.stringify({
            [varName]: val,
        }));
    }

    return [value, changeHandler];
}
