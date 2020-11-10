import history from "./history";
import authService from "./auth";

class SearchService {
    #searchStr;
    #subscribers;

    constructor() {
        this.#searchStr = getSearchFromLocation(history.location.search);
        this.#subscribers = [];
        if (authService.isAuthenticated) {
            this._subscribeHistory();
        }
        authService.subscribe(this._onAuthChange);
    }

    get search() {
        return this.#searchStr;
    }

    subscribe(callback) {
        this.#subscribers.push(callback);

        return () => {
            this.#subscribers = this.#subscribers.filter(item => item !== callback);
        };
    }

    showItems(value) {
        if (value !== this.#searchStr) {
            history.push(`/items?search=${value}`);
        }
    }

    _subscribeHistory() {
        this._unsubscribeHistory = history.listen(this._onHistoryChange);
    }

    _onHistoryChange = (location) => {
        if (location.pathname !== '/items') {
            return;
        }

        const urlSearch = getSearchFromLocation(location.search);
        if (this.#searchStr !== urlSearch) {
            this._setSearch(urlSearch);
        }
    }

    _onAuthChange = (isAuthenticated) => {
        if (isAuthenticated) {
            this._subscribeHistory();
        } else {
            this.#searchStr = '';
            this._unsubscribeHistory();
        }
    }

    _setSearch(value) {
        this.#searchStr = value;

        setTimeout(() => {
            this.#subscribers.forEach(callback => callback(this.#searchStr));
        }, 0);
    }
}

function getSearchFromLocation(value) {
    return new URLSearchParams(value).get('search') ?? '';
}

const searchService = new SearchService();

export default searchService;
