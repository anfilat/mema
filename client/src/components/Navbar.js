import React from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, Toolbar, Button} from '@material-ui/core';
import Search from './Search';
import AppMenu from './AppMenu';
import history from '../services/history';
import searchService from '../services/search';

const NavButton = withStyles((theme) => ({
    root: {
        color: theme.palette.primary.contrastText,
    },
}))(Button);

export default function Navbar() {
    useHotkeys('alt+n,alt+i', (event, handler) => {
        event.preventDefault();

        if (handler.key === 'alt+n') {
            handleNewPage();
        } else if (handler.key === 'alt+i') {
            handleItemsPage();
        }
    }, {
        enableOnTags: ["INPUT"],
    });

    function handleNewPage() {
        history.push('/new');
    }

    function handleItemsPage() {
        const search = searchService.search;
        if (search) {
            history.push(`/items?search=${search}`);
        } else {
            history.push('/items');
        }
    }

    return (
        <AppBar position="sticky">
            <Toolbar>
                <AppMenu/>
                <NavButton onClick={handleNewPage}>
                    New
                </NavButton>
                <NavButton onClick={handleItemsPage}>
                    Items
                </NavButton>
                <Search/>
            </Toolbar>
        </AppBar>
    );
}
