import {createContext} from 'react';

function noop() {
}

export const AuthContext = createContext({
    authToken: null,
    refreshToken: null,
    userId: null,
    login: noop,
    logout: noop,
    isAuthenticated: false
});
