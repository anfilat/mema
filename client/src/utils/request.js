import authService from "../services/auth";

export class Request {
    #component;
    #autoLogout;
    #loadingName;
    #cancelPrev;
    #silent;
    #abortOnUnmount;
    #abortController;
    #unmounted;

    constructor(component, {
        autoLogout = true,
        loadingName = 'loading',
        cancelPrev = false,
        silent = false,
        abortOnUnmount = true,
    } = {}) {
        this.#component = component;
        this.#autoLogout = autoLogout;
        this.#loadingName = loadingName;
        this.#cancelPrev = cancelPrev;
        this.#silent = silent;
        this.#abortOnUnmount = abortOnUnmount;
        this.#abortController = null;
        this.#unmounted = false;
    }

    fetch(url, body = null) {
        if (this.#cancelPrev) {
            this.stop();
        } else if (this.#abortController) {
            return;
        }

        const abortController = new AbortController();
        this.#abortController = abortController;
        this._changeLoadingState(true);

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

                if (this.#autoLogout && status === 401) {
                    abortController.abort();
                    authService.logout();
                }

                return {
                    ok,
                    status,
                    data,
                    error,
                };
            })
            .catch(err => {
                return {
                    ok: false,
                    status: null,
                    data: null,
                    error: err.message ?? 'Something went wrong',
                };
            })
            .then(result => {
                const unmounted = this.#unmounted;
                const aborted = abortController.signal.aborted || unmounted;
                if (!aborted) {
                    this.#abortController = null;
                    this._changeLoadingState(false);
                }

                return {
                    ...result,
                    aborted,
                    unmounted,
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
            this._changeLoadingState(false);
        }
    }

    _changeLoadingState(value) {
        if (!this.#silent && !this.#unmounted) {
            this.#component.setState({[this.#loadingName]: value});
        }
    }
}
