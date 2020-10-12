import React, {useContext} from 'react';
import {useHistory} from 'react-router-dom';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {AppBar, Toolbar, Box, IconButton, Menu, MenuItem, Button} from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {AuthContext} from '../context/AuthContext';
import {useHttp} from "../hooks/http.hook";

const useStyles = makeStyles({
    toolbar: {
        flexGrow: 1,
    },
});

const NavButton = withStyles((theme) => ({
    root: {
        color: theme.palette.primary.contrastText,
    },
}))(Button);

export const Navbar = () => {
    const history = useHistory();
    const classes = useStyles();
    const auth = useContext(AuthContext);
    const {loading, request} = useHttp();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    function handleMenu(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setAnchorEl(null);
    }

    async function handleLogout(event) {
        event.preventDefault();

        auth.logout();
        await request('/api/auth/logout', 'POST');
        history.push('/');
    }

    function handleNewPage() {
        history.push('/new');
    }

    function handleItemsPage() {
        history.push('/items');
    }

    return (
        <AppBar position="sticky">
            <Toolbar>
                <Box className={classes.toolbar}>
                    <NavButton onClick={handleNewPage}>
                        New
                    </NavButton>
                    <NavButton onClick={handleItemsPage}>
                        Items
                    </NavButton>
                </Box>
                <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                >
                    <AccountCircle />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleMenuClose}
                >
                    <MenuItem
                        onClick={handleLogout}
                        disabled={loading}>
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};
