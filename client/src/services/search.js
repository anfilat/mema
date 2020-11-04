let searchStr = '';

let subscribers = [];

export function getSearch() {
    return searchStr;
}

export function setSearch(value) {
    if (searchStr === value) {
        return;
    }

    searchStr = value;

    setTimeout(() => {
        subscribers.forEach(callback => callback(searchStr));
    }, 0);
}

export function subscribe(callback) {
    subscribers.push(callback);

    return () => {
        subscribers = subscribers.filter(item => item !== callback);
    };
}

export function clean() {
    searchStr = '';
}
