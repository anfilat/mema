import React, {useContext, useEffect} from 'react';
import {useHistory} from 'react-router-dom'
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

export const RegisterPage = () => {
    const classes = useStyles();
    const auth = useContext(AuthContext);
    const history = useHistory();
    const {enqueueSnackbar} = useSnackbar();
    const {loading, request, error, clearError} = useHttp();
    const [email, emailChangeHandler] = useBind('');
    const [password, passwordChangeHandler] = useBind('');

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error);
            clearError();
        }
    }, [error, enqueueSnackbar, clearError]);

    async function registerHandler(event) {
        event.preventDefault();
        try {
            const data = await request('/api/auth/register', 'POST', {email, password});
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