import React, {useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {Container, Box, Button, TextField, Link, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import useOnCallEffect from 'oncalleffect-hook';
import authService from '../services/auth';
import Copyright from '../components/Copyright';
import Title from '../components/Title';
import {Request} from '../utils';
import useSnackbarEx from '../hooks/snackbarEx.hook';
import useBind from '../hooks/bind.hook';

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

export default function LoginPage() {
    const classes = useStyles();
    const {showError} = useSnackbarEx();
    const [email, emailChangeHandler] = useBind('');
    const [password, passwordChangeHandler] = useBind('');
    const [loading, setLoading] = useState(false);

    function loginHandler(event) {
        event.preventDefault();
        login();
    }

    const login = useOnCallEffect(() => {
        setLoading(true);

        const request = new Request({autoLogout: false});
        request.fetch('/api/auth/login', {
            email,
            password,
        }).then(({ok, data, error, exit}) => {
            if (exit) {
                return;
            }

            setLoading(false);

            if (ok) {
                authService.login(data.userId);
            } else {
                showError(error);
            }
        });

        return (mounted) => {
            if (!mounted && request) {
                request.willUnmount();
            }
        }
    });

    return (
        <Container component="main" maxWidth="xs">
            <Title title="Login"/>
            <div className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <form className={classes.form} noValidate onSubmit={loginHandler}>
                    <TextField
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        margin="normal"
                        autoComplete="email"
                        value={email}
                        onChange={emailChangeHandler}
                        required
                        fullWidth
                        autoFocus
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        autoComplete="current-password"
                        value={password}
                        onChange={passwordChangeHandler}
                        required
                        fullWidth
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        disabled={loading}
                    >
                        Login
                    </Button>
                    {process.env.REACT_APP_REGISTER === 'yes' &&
                    <Box display="flex" justifyContent="flex-end">
                        <Link component={RouterLink} to="/register" variant="body2">
                            Don't have an account? Register
                        </Link>
                    </Box>
                    }
                </form>
            </div>
            <Box mt={8}>
                <Copyright/>
            </Box>
        </Container>
    );
}
