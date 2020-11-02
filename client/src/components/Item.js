import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Chip} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    main: {
        padding: `${theme.spacing(1)}px`,
        border: '1px solid #AAA',
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
}));

export const Item = (props) => {
    const classes = useStyles();

    return (
        <div className={classes.main}>
            <div
                dangerouslySetInnerHTML={{__html: props.text}}
            />
            <div className={classes.tags}>
                {props.tags.map(tag => <Chip label={tag} key={tag}/>)}
            </div>
        </div>
    );
};
