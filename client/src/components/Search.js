import React from 'react';
import {makeStyles, fade} from '@material-ui/core/styles';
import {InputBase, IconButton} from '@material-ui/core';
import {Search as SearchIcon} from '@material-ui/icons';
import useFullEffect from 'fulleffect-hook';
import searchService from '../services/search';
import useBind from '../hooks/bind.hook';

const useStyles = makeStyles((theme) => ({
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
}));

export default function Search() {
    const classes = useStyles();
    const [value, changeHandler, setValue] = useBind(searchService.search);

    useFullEffect(() => {
        const unsubscribe = searchService.subscribe((value) => {
            setValue(value);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    function focusHandler(event) {
        event.target.select();
    }

    function searchHandler(event) {
        event.preventDefault();

        searchService.showItems(value);
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
