import React from 'react';
import {useHistory} from 'react-router-dom';
import {useHotkeys} from 'react-hotkeys-hook';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, Toolbar, Button} from '@material-ui/core';
import {Search} from './Search';
import {AppMenu} from './AppMenu';
import {getSearch} from '../services/search';

const NavButton = withStyles((theme) => ({
    root: {
        color: theme.palette.primary.contrastText,
    },
}))(Button);

export const Navbar = () => {
    const history = useHistory();

    useHotkeys('alt+n,alt+i', (event, handler) => {
        event.preventDefault();

        if (handler.key === 'alt+n') {
            handleNewPage();
        } else if (handler.key === 'alt+i') {
            handleItemsPage();
        }
    }, {
        filter: () => true,
    });

    function handleNewPage() {
        history.push('/new');
    }

    function handleItemsPage() {
        const search = getSearch();
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
};
