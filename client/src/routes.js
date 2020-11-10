import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewPage from './pages/NewPage';
import ItemsPage from './pages/ItemsPage';
import EditPage from './pages/EditPage';

export default function Routes(isAuthenticated) {
    if (isAuthenticated) {
        return (
            <Switch>
                <Route path="/new" exact>
                    <NewPage/>
                </Route>
                <Route path="/items" exact>
                    <ItemsPage/>
                </Route>
                <Route path="/edit/:id" exact>
                    <EditPage/>
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
}
