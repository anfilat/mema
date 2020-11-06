import React from 'react';
import {useHistory} from 'react-router-dom';
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
