import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {withStyles} from "@material-ui/core/styles";
import {Chip, Card, CardContent, Box, Link} from '@material-ui/core';

const styles = theme => ({
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
});

function Item(props) {
    const {classes, id, time, html, tags} = props;
    const editLink = `/edit/${id}`;

    return (
        <Card variant="outlined" className={classes.main}>
            <CardContent>
                <Box display="flex" justifyContent="space-between">
                    {renderTime(time)}
                    <Link component={RouterLink} to={editLink} variant="body2">
                        Edit
                    </Link>
                </Box>
                <div
                    dangerouslySetInnerHTML={{__html: html}}
                />
                <div className={classes.tags}>
                    {tags.map(tag => <Chip label={tag} key={tag}/>)}
                </div>
            </CardContent>
        </Card>
    );
}

function renderTime(time) {
    const date = new Date(time);
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default withStyles(styles)(Item);
