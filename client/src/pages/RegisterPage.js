import React, {useContext, useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom'
import {Container, Box, Button, TextField, Link, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {useSnackbar} from 'notistack';
import {Copyright} from '../components/Copyright';
import {useHttp} from '../hooks/http.hook';
import {AuthContext} from '../context/AuthContext';

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export const RegisterPage = () => {
    const classes = useStyles();
    const auth = useContext(AuthContext);
    const history = useHistory();
    const {enqueueSnackbar} = useSnackbar();
    const {loading, request, error, clearError} = useHttp();
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error);
            clearError();
        }
    }, [error, enqueueSnackbar, clearError]);

    function changeHandler(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    }

    async function registerHandler(event) {
        event.preventDefault();
        try {
            const data = await request('/api/auth/register', 'POST', {...form});
            enqueueSnackbar(data.message);
            auth.login(data.token, data.userId);
            history.push('/');
        } catch (e) {
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Register
                </Typography>
                <form className={classes.form} noValidate onSubmit={registerHandler}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={form.email}
                        onChange={changeHandler}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={changeHandler}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={loading}
                    >
                        Register
                    </Button>
                    <Box display="flex" justifyContent="flex-end">
                        <Link href="/" variant="body2">
                            Already have an account? Login
                        </Link>
                    </Box>
                </form>
            </div>
            <Box mt={8}>
                <Copyright />
            </Box>
        </Container>
    );
};
