import React from 'react';
import {CircularProgress} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
});

export default function Loader() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <CircularProgress size={60}/>
        </div>
    );
}
