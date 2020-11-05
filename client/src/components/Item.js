import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {makeStyles} from "@material-ui/core/styles";
import {Chip, Card, CardContent, Box, Link} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    main: {
        marginBottom: `${theme.spacing(1)}px`,
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
    const editLink = `/edit/${props.id}`;

    return (
        <Card variant="outlined" className={classes.main}>
            <CardContent>
                <Box display="flex" justifyContent="space-between">
                    {renderTime(props.time)}
                    <Link component={RouterLink} to={editLink} variant="body2">
                        Edit
                    </Link>
                </Box>
                <div
                    dangerouslySetInnerHTML={{__html: props.html}}
                />
                <div className={classes.tags}>
                    {props.tags.map(tag => <Chip label={tag} key={tag}/>)}
                </div>
            </CardContent>
        </Card>
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
