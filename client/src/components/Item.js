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
            <div>
                {renderTime(props.time)}
            </div>
            <div
                dangerouslySetInnerHTML={{__html: props.html}}
            />
            <div className={classes.tags}>
                {props.tags.map(tag => <Chip label={tag} key={tag}/>)}
            </div>
        </div>
    );
};

function renderTime(time) {
    const date = new Date(time);
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
