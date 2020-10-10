import {useState, useCallback} from 'react';

export function useNotAuthHttp() {
    const [loading, setLoading] = useState(false);

    const request = useCallback(async function(url, method = 'GET', body = null, headers = {}) {
        let ok = false;
        let status;
        let data = null;
        let error = null;

        setLoading(true);
        try {
            if (body) {
                body = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(url, {method, body, headers});

            ok = response.ok;
            status = response.status;
            data = await response.json();

            if (!ok) {
                error = data.message ?? 'Something went wrong';
            }
        } catch (e) {
            error = e.message ?? 'Something went wrong';
        }
        setLoading(false);

        return {
            ok: ok && !error,
            status,
            data,
            error,
        };
    }, []);

    return {loading, request};
}
