import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import {CssBaseline} from '@material-ui/core';
import {SnackbarProvider} from 'notistack';
import {Routes} from './routes';
import {AuthContext} from './context/AuthContext';
import * as search from './services/search';
import {Navbar} from './components/Navbar';

const storageName = 'userData';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: this.readLocalStorageUserId(),
        };
    }

    readLocalStorageUserId() {
        try {
            const data = JSON.parse(localStorage.getItem(storageName));
            return data?.userId ?? null;
        } catch {
        }
        return null;
    }

    login = (userId) => {
        this.setState({userId});

        localStorage.setItem(storageName, JSON.stringify({
            userId,
        }));
    }

    logout = () => {
        this.setState({userId: null});
        localStorage.clear();
        search.clean();
    }

    render() {
        const userId = this.state.userId;
        const isAuthenticated = !!userId;

        return (
            <AuthContext.Provider value={{
                login: this.login,
                logout: this.logout,
                userId,
                isAuthenticated,
            }}>
                <CssBaseline/>
                <SnackbarProvider hideIconVariant maxSnack={3} autoHideDuration={1000} anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                    <Router>
                        {isAuthenticated && <Navbar/>}
                        <div className="container">
                            {Routes(isAuthenticated)}
                        </div>
                    </Router>
                </SnackbarProvider>
            </AuthContext.Provider>
        );
    }
}
