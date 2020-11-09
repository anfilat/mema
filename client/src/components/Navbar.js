import React from 'react';
import {withRouter} from 'react-router-dom';
import Hotkeys from 'react-hot-keys';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, Toolbar, Button} from '@material-ui/core';
import Search from './Search';
import AppMenu from './AppMenu';
import {getSearch} from '../services/search';

const NavButton = withStyles((theme) => ({
    root: {
        color: theme.palette.primary.contrastText,
    },
}))(Button);

class Navbar extends React.Component {
    handleHotkey = (keyName, event) => {
        event.preventDefault();

        if (keyName === 'alt+n') {
            this.handleNewPage();
        } else if (keyName === 'alt+i') {
            this.handleItemsPage();
        }
    }

    handleNewPage = () => {
        this.props.history.push('/new');
    }

    handleItemsPage = () => {
        const search = getSearch();
        if (search) {
            this.props.history.push(`/items?search=${search}`);
        } else {
            this.props.history.push('/items');
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
                        <AppMenu history={this.props.history}/>
                        <NavButton onClick={this.handleNewPage}>
                            New
                        </NavButton>
                        <NavButton onClick={this.handleItemsPage}>
                            Items
                        </NavButton>
                        <Search history={this.props.history}/>
                    </Toolbar>
                </AppBar>
            </Hotkeys>
        );
    }
}

export default withRouter(Navbar);
