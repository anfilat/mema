const storageName = 'userData';

class AuthService {
    #userId;
    #subscribers;

    constructor() {
        this.#userId = readUserId();
        this.#subscribers = [];
    }

    get isAuthenticated() {
        return !!this.#userId;
    }

    login(userId) {
        if (this.#userId) {
            return;
        }
        saveUserId(userId);
        this._setUserId(userId);
    }

    logout() {
        if (!this.#userId) {
            return;
        }
        clearUserId();
        this._setUserId(null);
    }

    subscribe(callback) {
        this.#subscribers.push(callback);

        return () => {
            this.#subscribers = this.#subscribers.filter(item => item !== callback);
        };
    }

    _setUserId(userId) {
        this.#userId = userId;

        setTimeout(() => {
            this.#subscribers.forEach(callback => callback(this.isAuthenticated));
        }, 0);
    }
}

function readUserId() {
    try {
        const data = JSON.parse(localStorage.getItem(storageName));
        return data?.userId ?? null;
    } catch {
    }
    return null;
}

function saveUserId(userId) {
    localStorage.setItem(storageName, JSON.stringify({
        userId,
    }));
}

function clearUserId() {
    localStorage.clear();
}

const authService = new AuthService();

export default authService;
