import {useState, useCallback, useEffect} from 'react';

const storageName = 'userData';

export const useAuth = () => {
    const [authToken, setAuthToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [ready, setReady] = useState(false);
    const [userId, setUserId] = useState(null);

    const login = useCallback((authToken, refreshToken, userId) => {
        setAuthToken(authToken);
        setRefreshToken(refreshToken);
        setUserId(userId);

        localStorage.setItem(storageName, JSON.stringify({
            authToken,
            refreshToken,
            userId,
        }));
    }, []);

    const logout = useCallback(() => {
        setAuthToken(null);
        setRefreshToken(null);
        setUserId(null);
        localStorage.clear();
    }, []);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem(storageName));

        if (data && data.authToken && data.refreshToken) {
            login(data.authToken, data.refreshToken, data.userId);
        }
        setReady(true);
    }, [login]);

    return {login, logout, authToken, refreshToken, userId, ready};
};
