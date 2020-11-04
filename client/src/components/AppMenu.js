import React, {useContext, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {IconButton, Menu, MenuItem} from '@material-ui/core';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {AuthContext} from '../context/AuthContext';
import {useHttp} from "../hooks/http.hook";

export const AppMenu = () => {
    const history = useHistory();
    const auth = useContext(AuthContext);
    const {loading, request} = useHttp();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    function handleMenu(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setAnchorEl(null);
    }

    async function handleLogout(event) {
        event.preventDefault();

        await request('/api/auth/logout', null, false);
        auth.logout();
        history.push('/');
    }

    return (
        <>
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
        </>
    );
};
