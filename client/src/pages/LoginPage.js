import React, {useContext} from 'react';
import {Link as RouterLink} from 'react-router-dom'
import {Container, Box, Button, TextField, Link, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {useSnackbar} from 'notistack';
import {Copyright} from '../components/Copyright';
import {useHttp} from '../hooks/http.hook';
import {useBind} from '../hooks/bind.hook';
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

export const LoginPage = () => {
    const classes = useStyles();
    const auth = useContext(AuthContext);
    const {enqueueSnackbar} = useSnackbar();
    const {loading, request} = useHttp();
    const [email, emailChangeHandler] = useBind('');
    const [password, passwordChangeHandler] = useBind('');

    async function loginHandler(event) {
        event.preventDefault();

        const {ok, data, error} = await request('/api/auth/login', 'POST', {email, password});
        if (ok) {
            auth.login(data.token, data.userId);
        } else {
            enqueueSnackbar(error);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <form className={classes.form} noValidate onSubmit={loginHandler}>
                    <TextField
                        label="Email Address"
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
                <Copyright />
            </Box>
        </Container>
    );
};
