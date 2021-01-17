import React, {useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';
import {Chip, Card, CardContent, Box, Link} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    main: {
        marginBottom: `${theme.spacing(1)}px`,
    },
    bottom: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.5),
        },
    },
    showAll: {
        color: theme.palette.primary.main,
        '&:hover': {
            cursor: 'pointer',
            textDecoration: 'underline',
        },
    }
}));

export default function Item(props) {
    const classes = useStyles();
    const {id, time, html, tags} = props;
    const [showAll, setShowAll] = useState(false);
    const editLink = `/edit/${id}`;
    const isFullHtml = html[1] !== '';
    const content = showAll ? html[1] : html[0];

    function handlesShowAll() {
        setShowAll(!showAll);
    }

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
                    dangerouslySetInnerHTML={{__html: content}}
                />
                <Box display="flex" className={classes.bottom}>
                    <div className={classes.tags}>
                        {tags.map(tag => <Chip label={tag} key={tag}/>)}
                    </div>
                    {isFullHtml &&
                        <div className={classes.showAll} onClick={handlesShowAll}>
                            {showAll ? 'Short' : 'Full'}
                        </div>
                    }
                </Box>
            </CardContent>
        </Card>
    );
}

function renderTime(time) {
    const date = new Date(time);
    const year = String(date.getFullYear()).padStart(4, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
