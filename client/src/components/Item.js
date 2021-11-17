import React, {useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';
import {Chip, Card, CardContent, Box, Link} from '@material-ui/core';
import searchService from '../services/search';

const useStyles = makeStyles(theme => ({
    main: {
        marginBottom: theme.spacing(1),
        position: 'relative',
    },
    content: {
        '& pre': {
            color: '#353535',
            backgroundColor: 'rgba(199, 199, 199, 0.3)',
            border: '1px solid #c4c4c4',
            'border-radius': '2px',
            padding: '1em',
        },
    },
    wait: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        opacity: 0.1,
        backgroundColor: '#000',
    },
    buttons: {
        display: 'flex',
        '& > * + *': {
            marginLeft: theme.spacing(1),
        },
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
    usedTag: {
        backgroundColor: '#ffffa0',
        cursor: 'pointer',
    },
    freeTag: {
        backgroundColor: '#81baeb',
        cursor: 'pointer',
    },
    button: {
        color: theme.palette.primary.main,
        '&:not([disabled]):hover': {
            cursor: 'pointer',
            textDecoration: 'underline',
        },
        '&[disabled]': {
            color: theme.palette.primary.light,
        },
    }
}));

export default function Item(props) {
    const classes = useStyles();
    const {
        id,
        time,
        html,
        tags,
        delItem,
        extractItem,
        extractDisabled,
        upItem,
        upDisabled,
        downItem,
        downDisabled,
        disableAll,
    } = props;
    const [showAll, setShowAll] = useState(false);
    const content = showAll ? html[1] : html[0];
    const isFullHtml = html[1] !== '';
    const editLink = `/edit/${id}`;

    function handleTagClick(tag) {
        if (searchService.isInTerms(tag)) {
            searchService.delTerm(tag);
        } else {
            searchService.addTerm(tag);
        }
    }

    function clickUp() {
        upItem(id);
    }

    function clickDown() {
        downItem(id);
    }

    function clickExtract() {
        extractItem(id);
    }

    function clickDel() {
        delItem(id);
    }

    function handlesShowAll() {
        setShowAll(!showAll);
    }

    return (
        <Card variant="outlined" className={classes.main}>
            <CardContent>
                <Box display="flex" justifyContent="space-between">
                    {renderTime(time)}
                    <div className={classes.buttons}>
                        <div className={classes.button} onClick={clickUp} disabled={upDisabled}>
                            Up
                        </div>
                        <div className={classes.button} onClick={clickDown} disabled={downDisabled}>
                            Down
                        </div>
                        <div className={classes.button} onClick={clickExtract} disabled={extractDisabled}>
                            Extract
                        </div>
                        <div className={classes.button} onClick={clickDel}>
                            Delete
                        </div>
                        <Link component={RouterLink} to={editLink} variant="body2">
                            Edit
                        </Link>
                    </div>
                </Box>
                <div className={classes.content}
                    dangerouslySetInnerHTML={{__html: content}}
                />
                <Box display="flex" className={classes.bottom}>
                    <div className={classes.tags}>
                        {tags.map(tag => <Chip
                            className={searchService.isInTerms(tag) ? classes.usedTag : classes.freeTag}
                            onClick={() => handleTagClick(tag)}
                            label={tag}
                            key={tag}/>
                        )}
                    </div>
                    {isFullHtml &&
                        <div className={classes.button} onClick={handlesShowAll}>
                            {showAll ? 'Short' : 'Full'}
                        </div>
                    }
                </Box>
            </CardContent>
            {disableAll && <div className={classes.wait}/>}
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
