import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {Container, Box, Button, TextField, Link, Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import {withSnackbar} from 'notistack';
import Copyright from '../components/Copyright';
import Title from '../components/Title';
import {AuthContext} from '../context/AuthContext';
import {bindField, bindShowError, request} from '../utils';

const styles = theme => ({
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
});

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            loading: false,
        };
        this.emailChangeHandler = bindField(this, 'email');
        this.passwordChangeHandler = bindField(this, 'password');
        this.showError = bindShowError(this);
        this.loginCancel = null;
    }

    static contextType = AuthContext;

    componentWillUnmount() {
        if (this.loginCancel) {
            this.loginCancel();
            this.loginCancel = null;
        }
    }

    loginHandler = (event) => {
        event.preventDefault();

        this.setState({loading: true});
        const {email, password} = this.state;
        const {wait, cancel} = request('/api/auth/login', {email, password}, false);
        wait.then(this.onLoginResult);
        this.loginCancel = cancel;
    }

    onLoginResult = ({ok, data, error, abort}) => {
        if (abort) {
            return;
        }
        this.setState({loading: false});
        this.loginCancel = null;

        if (ok) {
            this.context.login(data.userId);
        } else {
            this.showError(error);
        }
    }

    render() {
        const {email, password, loading} = this.state;
        const classes = this.props.classes;

        return (
            <Container component="main" maxWidth="xs">
                <Title title="Login"/>
                <div className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        Login
                    </Typography>
                    <form className={classes.form} noValidate onSubmit={this.loginHandler}>
                        <TextField
                            label="Email Address"
                            type="email"
                            variant="outlined"
                            margin="normal"
                            autoComplete="email"
                            value={email}
                            onChange={this.emailChangeHandler}
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
                            onChange={this.passwordChangeHandler}
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
}

export default withStyles(styles)(withSnackbar(LoginPage));
