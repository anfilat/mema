import {useState} from 'react';

export function useBind(initialValue) {
    const [value, setValue] = useState(initialValue);

    function changeHandler(event) {
        setValue(event.target.value);
    }

    return [value, changeHandler];
}
