import {useState, useCallback, useContext} from 'react';
import {AuthContext} from "../context/AuthContext";

let refreshRequest = null;

export function useHttp() {
    const auth = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const request = useCallback(async function(url, method = 'GET', body = null, headers = {}) {
        let ok = false;
        let status;
        let data = null;
        let error = null;

        setLoading(true);
        try {
            headers['Authorization'] = `Bearer ${auth.authToken}`;
            if (body) {
                body = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
            }

            let response = await fetch(url, {method, body, headers});

            if (response.status === 401 && auth.refreshToken) {
                if (!refreshRequest) {
                    refreshRequest = fetch('/api/auth/refresh', {
                        method: 'POST',
                        body: JSON.stringify({refreshToken: auth.refreshToken}),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }
                const resp = await refreshRequest;
                refreshRequest = null;
                if (resp.ok) {
                    const data = await resp.json();
                    auth.login(data.authToken, data.refreshToken, data.userId);
                    headers['Authorization'] = `Bearer ${data.authToken}`;
                    response = await fetch(url, {method, body, headers});
                }
            }

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
    }, [auth]);

    return {loading, request};
}
