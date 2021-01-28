import {parseTerms, stringifyTerms} from 'common';
import history from './history';
import authService from './auth';

class SearchService {
    #subscribers;
    #pathname;
    #searchStr;
    #terms = [];
    #curSearch;

    constructor() {
        this.#subscribers = [];
        this.#pathname = history.location.pathname;
        this._setSearch(getSearchFromLocation(history.location.search));
        if (authService.isAuthenticated) {
            this._subscribeHistory();
        }
        authService.subscribe(this._onAuthChange);
    }

    get search() {
        return this.#searchStr;
    }

    set curSearch(value) {
        this.#curSearch = value.trim();
    }

    subscribe(callback) {
        this.#subscribers.push(callback);

        return () => {
            this.#subscribers = this.#subscribers.filter(item => item !== callback);
        };
    }

    showItems() {
        if (this.#pathname !== '/items' || this.#curSearch !== this.#searchStr) {
            if (this.#curSearch) {
                history.push(`/items?search=${encodeURIComponent(this.#curSearch)}`);
            } else {
                history.push(`/items`);
            }
        }
    }

    isInTerms(value) {
        const val = value.trim();
        return this.#terms.includes(val);
    }

    addTerm(value) {
        this.curSearch = stringifyTerms([...this.#terms, value]);
        this.showItems();
    }

    delTerm(value) {
        this.curSearch = stringifyTerms(this.#terms.filter(term => term !== value));
        this.showItems();
    }

    _subscribeHistory() {
        this._unsubscribeHistory = history.listen(this._onHistoryChange);
    }

    _onHistoryChange = (location) => {
        this.#pathname = location.pathname;
        if (this.#pathname !== '/items') {
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
            this.#terms = [];
            this._unsubscribeHistory();
        }
    }

    _setSearch(value) {
        this.#searchStr = value.trim();
        this.#terms = parseTerms(this.#searchStr);

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
