import {useState} from 'react';

export function useLocalStorageVars(key, initialVars) {
    const [vars, setVars] = useState(() => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return {...initialVars, ...data};
        } catch {
            return {...initialVars};
        }
    });

    function changeVars(values) {
        setVars(vars => {
            const newVars = {...vars, ...values};
            localStorage.setItem(key, JSON.stringify(newVars));
            return newVars;
        });
    }

    function delVars() {
        localStorage.removeItem(key);
    }

    return [vars, changeVars, delVars];
}
