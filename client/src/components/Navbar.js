import React from 'react';
import Hotkeys from 'react-hot-keys';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, Toolbar, Button} from '@material-ui/core';
import Search from './Search';
import AppMenu from './AppMenu';
import history from "../services/history";
import searchService from '../services/search';

const NavButton = withStyles((theme) => ({
    root: {
        color: theme.palette.primary.contrastText,
    },
}))(Button);

export default class Navbar extends React.Component {
    handleHotkey = (keyName, event) => {
        event.preventDefault();

        if (keyName === 'alt+n') {
            this.handleNewPage();
        } else if (keyName === 'alt+i') {
            this.handleItemsPage();
        }
    }

    handleNewPage = () => {
        history.push('/new');
    }

    handleItemsPage = () => {
        const search = searchService.search;
        if (search) {
            history.push(`/items?search=${search}`);
        } else {
            history.push('/items');
        }
    }

    render() {
        return (
            <Hotkeys
                keyName="alt+n,alt+i"
                filter={() => true}
                onKeyDown={this.handleHotkey}
            >
                <AppBar position="sticky">
                    <Toolbar>
                        <AppMenu/>
                        <NavButton onClick={this.handleNewPage}>
                            New
                        </NavButton>
                        <NavButton onClick={this.handleItemsPage}>
                            Items
                        </NavButton>
                        <Search/>
                    </Toolbar>
                </AppBar>
            </Hotkeys>
        );
    }
}
