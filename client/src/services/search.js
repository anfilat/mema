let searchStr = '';

export function setSearch(value) {
    searchStr = value;
}

export function getSearch() {
    return searchStr;
}

export function clean() {
    searchStr = '';
}
