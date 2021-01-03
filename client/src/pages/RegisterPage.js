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

export default function RegisterPage() {
    const classes = useStyles();
    const {showSuccess, showError} = useSnackbarEx();
    const [email, emailChangeHandler] = useBind('');
    const [password, passwordChangeHandler] = useBind('');
    const [loading, setLoading] = useState(false);

    function registerHandler(event) {
        event.preventDefault();
        register();
    }

    const register = useOnCallEffect(() => {
        setLoading(true);

        const request = new Request({autoLogout: false});
        request.fetch('/api/auth/register', {
            email,
            password,
        }).then(({ok, data, error, exit}) => {
            if (exit) {
                return;
            }

            setLoading(false);

            if (ok) {
                showSuccess(data.message);
                authService.login(data.userId);
            } else {
                showError(error);
            }
        });

        return (mounted) => {
            if (!mounted) {
                request.willUnmount();
            }
        }
    });

    return (
        <Container component="main" maxWidth="xs">
            <Title title="Register"/>
            <div className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Register
                </Typography>
                <form className={classes.form} noValidate onSubmit={registerHandler}>
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
                        Register
                    </Button>
                    <Box display="flex" justifyContent="flex-end">
                        <Link component={RouterLink} to="/" variant="body2">
                            Already have an account? Login
                        </Link>
                    </Box>
                </form>
            </div>
            <Box mt={8}>
                <Copyright/>
            </Box>
        </Container>
    );
}
