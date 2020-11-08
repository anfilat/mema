export function request(url, body = null, autoLogout = true, logout) {
    const controller = new AbortController();

    const headers = {};
    if (body) {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
    }

    const wait = fetch(url, {
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
                logout();
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
        });

    function cancel() {
        controller.abort();
    }

    return {
        wait,
        cancel,
    };
}
