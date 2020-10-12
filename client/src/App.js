import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {CssBaseline} from '@material-ui/core';
import {SnackbarProvider} from 'notistack';
import {useRoutes} from './routes';
import {useAuth} from './hooks/auth.hook';
import {AuthContext} from './context/AuthContext';
import {Navbar} from './components/Navbar';
import {Loader} from './components/Loader';

function App() {
    const {authToken, refreshToken, login, logout, userId, ready} = useAuth();
    const isAuthenticated = !!userId;
    const routes = useRoutes(isAuthenticated);
    let content;

    if (ready) {
        content = <Router>
            {isAuthenticated && <Navbar/>}
            <div className="container">
                {routes}
            </div>
        </Router>;
    } else {
        content = <Loader/>;
    }

    return (
        <AuthContext.Provider value={{
            authToken, refreshToken, login, logout, userId, isAuthenticated
        }}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3} anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}>
                {content}
            </SnackbarProvider>
        </AuthContext.Provider>
    );
}

export default App;
