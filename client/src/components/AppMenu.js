import React from 'react';
import {IconButton, Menu, MenuItem} from '@material-ui/core';
import {Menu as MenuIcon} from '@material-ui/icons';
import authService from '../services/auth';
import {Request} from "../utils";
import projectInfo from "../../package.json";

class AppMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            loading: false,
        };
        this.request = new Request(this, {autoLogout: false});
    }

    handleMenu = (event) => {
        this.setState({anchorEl: event.currentTarget});
    }

    handleMenuClose = () => {
        this.setState({anchorEl: null});
    }

    handleLogout = (event) => {
        event.preventDefault();

        this.request.fetch('/api/auth/logout')
            .then(() => {
                authService.logout();
            });
    }

    render() {
        const {anchorEl, loading} = this.state;
        const isOpen = Boolean(anchorEl);
        const version = `MemA ${projectInfo.version}-${process.env.REACT_APP_GIT_SHA}`;

        return (
            <>
                <IconButton
                    aria-label="show more"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={this.handleMenu}
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
                    onClose={this.handleMenuClose}
                >
                    <MenuItem
                        onClick={this.handleLogout}
                        disabled={loading}>
                        Logout
                    </MenuItem>
                    <MenuItem
                        onClick={this.handleMenuClose}>
                        {version}
                    </MenuItem>
                </Menu>
            </>
        );
    }
}

export default AppMenu;
