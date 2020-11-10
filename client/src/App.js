import React from 'react';
import {Router} from 'react-router-dom';
import {CssBaseline} from '@material-ui/core';
import {SnackbarProvider} from 'notistack';
import Routes from './routes';
import history from "./services/history";
import authService from './services/auth';
import Navbar from './components/Navbar';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAuthenticated: authService.isAuthenticated,
        };
        authService.subscribe(this.onAuthChange);
    }

    onAuthChange = (isAuthenticated) => {
        this.setState({isAuthenticated});
    }

    render() {
        const {isAuthenticated} = this.state;

        return (
            <>
                <CssBaseline/>
                <SnackbarProvider hideIconVariant maxSnack={3} autoHideDuration={1000} anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                    <Router history={history}>
                        {isAuthenticated && <Navbar/>}
                        <div className="container">
                            {Routes(isAuthenticated)}
                        </div>
                    </Router>
                </SnackbarProvider>
            </>
        );
    }
}
