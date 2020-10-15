import {useState, useCallback, useEffect} from 'react';

const storageName = 'userData';

export const useAuth = () => {
    const [ready, setReady] = useState(false);
    const [userId, setUserId] = useState(null);

    const login = useCallback((userId) => {
        setUserId(userId);

        localStorage.setItem(storageName, JSON.stringify({
            userId,
        }));
    }, []);

    const logout = useCallback(() => {
        setUserId(null);
        localStorage.clear();
    }, []);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem(storageName));

        if (data && data.userId) {
            login(data.userId);
        }
        setReady(true);
    }, [login]);

    return {login, logout, userId, ready};
};
