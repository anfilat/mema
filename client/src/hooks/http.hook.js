import {useState, useCallback, useContext} from 'react';
import {AuthContext} from "../context/AuthContext";

export function useHttp() {
    const auth = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const request = useCallback(async function(url, body = null, autoLogout = true) {
        let ok = false;
        let status;
        let data = null;
        let error = null;

        setLoading(true);
        try {
            const method = 'POST';
            const headers = {};

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

        if (status === 401 && autoLogout) {
            auth.logout();
        }

        return {
            ok: ok && !error,
            status,
            data,
            error,
        };
    }, [auth]);

    return {loading, request};
}
