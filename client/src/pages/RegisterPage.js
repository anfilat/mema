import React, {useEffect, useState} from 'react';
import {NavLink, useHistory} from 'react-router-dom'
import {useHttp} from '../hooks/http.hook';
import {useMessage} from '../hooks/message.hook';

import styles from './LoginPage.module.css';

export const RegisterPage = () => {
    const history = useHistory();
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

    const registerHandler = async event => {
        event.preventDefault();
        try {
            const data = await request('/api/auth/register', 'POST', {...form});
            message(data.message);
            history.push('/');
        } catch (e) {
        }
    };

    return (
        <div className="row">
            <div className="col s12 m10 offset-m1 l6 offset-l3">
                <h1>Scrap Count</h1>
                <div className="card blue darken-1">
                    <form onSubmit={registerHandler}>
                        <div className="card-content white-text">
                            <div className={styles.header}>
                                <span className="card-title">Login</span>
                                <NavLink
                                    className="btn grey lighten-1 black-text"
                                    to="/"
                                >
                                    Login
                                </NavLink>
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
                                Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
