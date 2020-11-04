import React from 'react';
import {useHistory} from 'react-router-dom';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {AppBar, Toolbar, Box, Button} from '@material-ui/core';
import {AppMenu} from './AppMenu';
import {getSearch} from '../services/search';

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
                <Box className={classes.toolbar}>
                    <NavButton onClick={handleNewPage}>
                        New
                    </NavButton>
                    <NavButton onClick={handleItemsPage}>
                        Items
                    </NavButton>
                </Box>
                <AppMenu/>
            </Toolbar>
        </AppBar>
    );
};
