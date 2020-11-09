import React from 'react';
import {IconButton, Menu, MenuItem} from '@material-ui/core';
import {Menu as MenuIcon} from '@material-ui/icons';
import {AuthContext} from '../context/AuthContext';
import projectInfo from "../../package.json";
import {request} from "../utils";

class AppMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            loading: false,
        };
        this.requestCancel = null;
    }

    static contextType = AuthContext;

    handleMenu = (event) => {
        this.setState({anchorEl: event.currentTarget});
    }

    handleMenuClose = () => {
        this.setState({anchorEl: null});
    }

    handleLogout = (event) => {
        event.preventDefault();

        request(this, '/api/auth/logout', null, false)
            .then(() => {
                this.context.logout();
                this.props.history.push('/');
            });
    }

    stopRequest() {
        if (this.requestCancel) {
            this.requestCancel();
            this.requestCancel = null;
            this.setState({loading: false});
        }
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
