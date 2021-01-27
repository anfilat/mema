import React, {useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';
import {Chip, Card, CardContent, Box, Link} from '@material-ui/core';
import searchService from '../services/search';
import DeleteDialog from './DeleteDialog';
import useDeleteItem from "../hooks/deleteItem.hool";

const useStyles = makeStyles(theme => ({
    main: {
        marginBottom: theme.spacing(1),
        position: 'relative',
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
        '&:hover': {
            cursor: 'pointer',
            textDecoration: 'underline',
        },
    }
}));

export default function Item(props) {
    const classes = useStyles();
    const {id, time, html, tags, remove} = props;
    const [showAll, setShowAll] = useState(false);
    const editLink = `/edit/${id}`;
    const isFullHtml = html[1] !== '';
    const content = showAll ? html[1] : html[0];
    const {clickDelete, reallyDelete, handleCloseDeleteDialog, openDeleteDialog, loading} = useDeleteItem(id, remove);

    function handleTagClick(tag) {
        if (searchService.isInTerms(tag)) {
            searchService.delTerm(tag);
        } else {
            searchService.addTerm(tag);
        }
    }

    function handlesShowAll() {
        setShowAll(!showAll);
    }

    return (
        <>
            <Card variant="outlined" className={classes.main}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between">
                        {renderTime(time)}
                        <div className={classes.buttons}>
                            <div className={classes.button} onClick={clickDelete}>
                                Delete
                            </div>
                            <Link component={RouterLink} to={editLink} variant="body2">
                                Edit
                            </Link>
                        </div>
                    </Box>
                    <div
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
                {loading && <div className={classes.wait}/>}
            </Card>
            <DeleteDialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                onOk={reallyDelete}
            />
        </>
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
