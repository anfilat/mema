import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {makeStyles, fade} from '@material-ui/core/styles';
import {InputBase, IconButton} from '@material-ui/core';
import {Search as SearchIcon} from '@material-ui/icons';
import {subscribe, getSearch} from '../services/search';

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

export const Search = () => {
    const classes = useStyles();
    const history = useHistory();
    const [value, setValue] = useState('');

    useEffect(() => {
        const unsubscribe = subscribe((value) => {
            setValue(value);
        });

        setValue(getSearch());

        return () => {
            unsubscribe();
        };
    }, []);

    function changeHandler(event) {
        setValue(event.target.value);
    }

    function searchHandler(event) {
        event.preventDefault();

        if (value !== getSearch()) {
            history.push(`/items?search=${value}`);
        }
    }

    return (
        <form
            noValidate
            className={classes.search}
            onSubmit={searchHandler}
        >
            <InputBase
                value={value}
                onChange={changeHandler}
                placeholder="Search…"
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                }}
                fullWidth
                inputProps={{ 'aria-label': 'search' }}
            />
            <IconButton
                type="submit"
                className={classes.searchIcon}
            >
                <SearchIcon />
            </IconButton>
        </form>
    );
};
