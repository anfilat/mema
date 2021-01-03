import authService from '../services/auth';

export class Request {
    #autoLogout;
    #abortOnUnmount;
    #abortController;
    #unmounted;

    constructor({
        autoLogout = true,
        abortOnUnmount = true,
    } = {}) {
        this.#autoLogout = autoLogout;
        this.#abortOnUnmount = abortOnUnmount;
        this.#abortController = null;
        this.#unmounted = false;
    }

    fetch(url, body = null) {
        const abortController = new AbortController();
        this.#abortController = abortController;

        const headers = {};
        if (body) {
            body = JSON.stringify(body);
            headers['Content-Type'] = 'application/json';
        }

        return fetch(url, {
            method: 'POST',
            body,
            headers,
            signal: abortController.signal,
        })
            .then(async (response) => {
                const ok = response.ok;
                const status = response.status;
                const data = await response.json();
                const error = ok ? null : data.message ?? 'Something went wrong';

                return {
                    ok,
                    status,
                    data,
                    error,
                };
            })
            .catch(err => {
                const abort = err.name === 'AbortError';

                return {
                    ok: false,
                    status: null,
                    data: null,
                    error: abort ? null : err.message ?? 'Something went wrong',
                };
            })
            .then(result => {
                const aborted = abortController.signal.aborted;
                const unmounted = this.#unmounted;
                const logout = this.#autoLogout && result.status === 401;

                if (logout) {
                    authService.logout();
                }

                if (!aborted) {
                    this.#abortController = null;
                }

                return {
                    ...result,
                    aborted,
                    exit: unmounted || logout,
                };
            });
    }

    willUnmount() {
        this.#unmounted = true;
        if (this.#abortOnUnmount && this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
        }
    }

    stop() {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = null;
        }
    }
}
