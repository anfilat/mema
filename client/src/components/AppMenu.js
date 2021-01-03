import React, {useState} from 'react';
import {IconButton, Menu, MenuItem} from '@material-ui/core';
import {Menu as MenuIcon} from '@material-ui/icons';
import useOnCallEffect from 'oncalleffect-hook';
import authService from '../services/auth';
import {Request} from '../utils';
import projectInfo from '../../package.json';

const version = `MemA ${projectInfo.version}-${process.env.REACT_APP_GIT_SHA}`;

export default function AppMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const isOpen = Boolean(anchorEl);

    function handleMenu(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleMenuClose() {
        setAnchorEl(null);
    }

    function handleLogout(event) {
        event.preventDefault();
        logout();
    }

    const logout = useOnCallEffect(() => {
        setLoading(true);

        const request = new Request({autoLogout: false});
        request.fetch('/api/auth/logout')
            .then(() => {
                authService.logout();
            });
    });

    return (
        <>
            <IconButton
                aria-label="show more"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <MenuIcon/>
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
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
                    {version}
                </MenuItem>
            </Menu>
        </>
    );
}
