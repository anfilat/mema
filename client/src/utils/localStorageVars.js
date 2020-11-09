export function localStorageVars(component, key, initialVars) {
    let vars;

    try {
        const data = JSON.parse(localStorage.getItem(key));
        vars = {...initialVars, ...data};
    } catch {
        vars = {...initialVars};
    }

    function changeVars(values) {
        component.setState(state => {
            const newState = {...state, ...values};
            localStorage.setItem(key, JSON.stringify(newState));
            return newState;
        });
    }

    function delVars() {
        localStorage.removeItem(key);
    }

    return {vars, changeVars, delVars};
}
