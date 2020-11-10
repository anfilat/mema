import React from 'react';
import {withStyles, fade} from '@material-ui/core/styles';
import {InputBase, IconButton} from '@material-ui/core';
import {Search as SearchIcon} from '@material-ui/icons';
import searchService from '../services/search';
import {bindField} from '../utils';

const styles = (theme) => ({
    search: {
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        marginRight: theme.spacing(1),
        width: '100%',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1),
    },
    searchIcon: {
        padding: theme.spacing(0, 1),
    },
});

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: searchService.search,
        };
        this.changeHandler = bindField(this, 'value');
        this.unsubscribe = searchService.subscribe(this.onSearchChange);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    onSearchChange = (value) => {
        this.setState({value});
    }

    focusHandler = (event) => {
        event.target.select();
    }

    searchHandler = (event) => {
        event.preventDefault();

        searchService.showItems(this.state.value);
    }

    render() {
        const {value} = this.state;
        const {classes} = this.props;

        return (
            <form
                noValidate
                className={classes.search}
                onSubmit={this.searchHandler}
            >
                <InputBase
                    value={value}
                    onFocus={this.focusHandler}
                    onChange={this.changeHandler}
                    placeholder="Search…"
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    }}
                    fullWidth
                    inputProps={{'aria-label': 'search'}}
                />
                <IconButton
                    type="submit"
                    aria-label="search"
                    className={classes.searchIcon}
                >
                    <SearchIcon/>
                </IconButton>
            </form>
        );
    }
}

export default withStyles(styles)(Search);
