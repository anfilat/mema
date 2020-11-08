import React from 'react';
import {CircularProgress} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

const styles = {
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
};

function Loader(props) {
    const classes = props.classes;

    return (
        <div className={classes.root}>
            <CircularProgress size={60}/>
        </div>
    );
}

export default withStyles(styles)(Loader);
