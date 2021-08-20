import React, {useState} from 'react';
import {makeStyles, alpha} from '@material-ui/core/styles';
import {InputBase, IconButton} from '@material-ui/core';
import {Search as SearchIcon} from '@material-ui/icons';
import useFullEffect from 'fulleffect-hook';
import searchService from '../services/search';

const useStyles = makeStyles((theme) => ({
    search: {
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
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
}));

export default function Search() {
    const classes = useStyles();
    const [value, setValue] = useState(searchService.search);

    useFullEffect(() => {
        const unsubscribe = searchService.subscribe(newValue);

        return () => {
            unsubscribe();
        };
    }, []);

    function changeHandler(event) {
        newValue(event.target.value);
    }

    function newValue(value) {
        setValue(value);
        searchService.curSearch = value;
    }

    function focusHandler(event) {
        event.target.select();
    }

    function searchHandler(event) {
        event.preventDefault();

        searchService.showItems();
    }

    return (
        <form
            noValidate
            className={classes.search}
            onSubmit={searchHandler}
        >
            <InputBase
                value={value}
                onFocus={focusHandler}
                onChange={changeHandler}
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
