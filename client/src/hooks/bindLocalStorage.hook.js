import {useState, useEffect} from 'react';

export function useBindLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return data && data.value ? data.value : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify({value}));
    }, [key, value]);

    return [value, setValue];
}
