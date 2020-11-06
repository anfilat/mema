import React, {useContext, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {IconButton, Menu, MenuItem} from '@material-ui/core';
import {Menu as MenuIcon} from '@material-ui/icons';
import {AuthContext} from '../context/AuthContext';
import {useHttp} from "../hooks/http.hook";
import projectInfo from "../../package.json";

export const AppMenu = () => {
    const history = useHistory();
    const auth = useContext(AuthContext);
    const {loading, request} = useHttp();
    const [anchorEl, setAnchorEl] = useState(null);
    const isOpen = Boolean(anchorEl);

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
                aria-label="show more"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <MenuIcon />
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
                open={isOpen}
                onClose={handleMenuClose}
            >
                <MenuItem
                    onClick={handleLogout}
                    disabled={loading}>
                    Logout
                </MenuItem>
                <MenuItem
                    onClick={handleMenuClose}>
                    {`MemA ${projectInfo.version}-${process.env.REACT_APP_GIT_SHA}`}
                </MenuItem>
            </Menu>
        </>
    );
};
