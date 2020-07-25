import React, {useContext, useEffect, useState} from 'react';
import {NavLink} from 'react-router-dom'
import {useHttp} from '../hooks/http.hook';
import {useMessage} from '../hooks/message.hook';
import {AuthContext} from '../context/AuthContext';

import styles from './LoginPage.module.css';

export const LoginPage = () => {
    const auth = useContext(AuthContext);
    const message = useMessage();
    const {loading, request, error, clearError} = useHttp();
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        window.M.updateTextFields();
    }, []);

    useEffect(() => {
        message(error);
        clearError();
    }, [error, message, clearError]);

    const changeHandler = event => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const loginHandler = async event => {
        event.preventDefault();
        try {
            const data = await request('/api/auth/login', 'POST', {...form});
            auth.login(data.token, data.userId);
        } catch (e) {
        }
    };

    return (
        <div className="row">
            <div className="col s12 m10 offset-m1 l6 offset-l3">
                <h1>Scrap Count</h1>
                <div className="card blue darken-1">
                    <form onSubmit={loginHandler}>
                        <div className="card-content white-text">
                            <div className={styles.header}>
                                <span className="card-title">Login</span>
                                {process.env.REACT_APP_REGISTER === 'yes' &&
                                <NavLink
                                    className="btn grey lighten-1 black-text"
                                    to="/register"
                                >
                                    Register
                                </NavLink>
                                }
                            </div>
                            <div>
                                <div className="input-field">
                                    <input
                                        placeholder="Enter email"
                                        id="email"
                                        type="text"
                                        name="email"
                                        className="yellow-input"
                                        value={form.email}
                                        onChange={changeHandler}
                                    />
                                    <label htmlFor="email">Email</label>
                                </div>

                                <div className="input-field">
                                    <input
                                        placeholder="Enter password"
                                        id="password"
                                        type="password"
                                        name="password"
                                        className="yellow-input"
                                        value={form.password}
                                        onChange={changeHandler}
                                    />
                                    <label htmlFor="email">Password</label>
                                </div>
                            </div>
                        </div>
                        <div className="card-action right-align">
                            <button
                                type="submit"
                                className="btn yellow darken-4"
                                disabled={loading}
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
