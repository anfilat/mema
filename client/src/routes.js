import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import {LoginPage} from './pages/LoginPage';
import {RegisterPage} from './pages/RegisterPage';
import {NewPage} from './pages/NewPage';

export const useRoutes = isAuthenticated => {
    if (isAuthenticated) {
        return (
            <Switch>
                <Route path="/new" exact>
                    <NewPage/>
                </Route>
                <Redirect to="/new"/>
            </Switch>
        );
    }

    return (
        <Switch>
            <Route path="/" exact>
                <LoginPage/>
            </Route>
            {process.env.REACT_APP_REGISTER === 'yes' &&
            <Route path="/register" exact>
                <RegisterPage/>
            </Route>
            }
            <Redirect to="/"/>
        </Switch>
    );
};
