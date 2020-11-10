import authService from "../services/auth";

export function request(component, url, body = null, autoLogout = true) {
    const controller = new AbortController();

    function cancel() {
        controller.abort();
    }

    component.stopRequest();
    component.requestCancel = cancel;
    component.setState({loading: true});

    const headers = {};
    if (body) {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
        method: 'POST',
        body,
        headers,
        signal: controller.signal,
    })
        .then(async (response) => {
            const ok = response.ok;
            const status = response.status;
            const data = await response.json();
            const error = ok ? null : data.message ?? 'Something went wrong';

            if (status === 401 && autoLogout) {
                authService.logout();
            }

            return {
                ok,
                status,
                data,
                error,
                abort: false,
            };
        })
        .catch(err => {
            const abort = err.name === 'AbortError';
            return {
                ok: false,
                status: null,
                data: null,
                error: err.message ?? 'Something went wrong',
                abort,
            };
        })
        .then(result => {
            if (!result.abort) {
                component.requestCancel = null;
                component.setState({loading: false});
            }

            return result;
        });
}
