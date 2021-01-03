import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import _ from 'lodash';
import {useHotkeys} from 'react-hotkeys-hook';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid, Fab, Menu, MenuItem} from '@material-ui/core';
import {Add as AddIcon} from '@material-ui/icons';
import {makeStyles} from '@material-ui/core/styles';
import useFullEffect from "fulleffect-hook";
import useOnCallEffect from "oncalleffect-hook";
import authService from '../services/auth';
import history from '../services/history';
import Loader from '../components/Loader';
import Title from '../components/Title';
import Tags from '../components/Tags';
import DeleteDialog from '../components/DeleteDialog';
import {editorConfig, editorStyles, Request} from '../utils';
import useEditor from '../hooks/editor.hook';
import useSnackbarEx from '../hooks/snackbarEx.hook';
import 'ckeditor5-custom-build/build/ckeditor';

const useStyles = makeStyles(editorStyles);

export default function EditPage() {
    const classes = useStyles();
    const {id: itemId} = useParams();
    const {initEditor, focusEditor} = useEditor();
    const {showSuccess, showError} = useSnackbarEx();
    const [initLoading, setInitLoading] = useState(true);
    const [textId, setTextId] = useState(null);
    const [text, setText] = useState('');
    const [tags, setTags] = useState([]);
    const [savedText, setSavedText] = useState('');
    const [savedTags, setSavedTags] = useState([]);
    const [firstSave, setFirstSave] = useState(true);
    const [loading, setLoading] = useState(false);
    const [outdated, setOutdated] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const isOpenMenu = Boolean(anchorEl);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [saveInProgress, setSaveInProgress] = useState(false);
    const isSaved = text === savedText && _.isEqual(tags, savedTags);
    const blockSave = isSaved || (text.trim() === '');

    const getLatest = useOnCallEffect(() => {
        setLoading(true);

        const request = new Request();
        request.fetch('/api/item/get', {
            itemId,
        }).then(onGetLatestResult);

        return (mounted) => {
            if (!mounted) {
                request.willUnmount();
            }
        }
    });

    function onGetLatestResult({ok, data, error, exit}) {
        if (error) {
            showError(error);
        }

        if (exit) {
            return;
        }

        setLoading(false);

        if (ok) {
            const {textId, text, tags} = data;

            setTextId(textId);
            setText(text);
            setTags(tags);
            setSavedText(text);
            setSavedTags(tags);
            setOutdated(false);
            setInitLoading(false);
        } else {
            history.push('/items');
        }
    }

    const deleteIt = useOnCallEffect(() => {
        setLoading(true);

        const request = new Request({abortOnUnmount: false});
        request.fetch('/api/item/del', {
            itemId,
        }).then(({ok, data, error, exit}) => {
            showRequestResult(ok, data, error);

            if (exit) {
                return;
            }

            setLoading(false);

            if (ok) {
                history.push('/items');
            }
        });

        return (mounted) => {
            if (!mounted) {
                request.willUnmount();
            }
        }
    });

    const saveIt = useOnCallEffect(() => {
        const api = firstSave ? '/api/item/resave' : '/api/item/update';
        setLoading(true);
        setSaveInProgress(true);

        const request = new Request({abortOnUnmount: false});
        request.fetch(api, {
            text,
            tags,
            itemId,
            textId,
        }).then(({ok, data, error, exit}) => {
            showRequestResult(ok, data, error);

            if (exit) {
                return;
            }

            setLoading(false);
            setSaveInProgress(false);

            if (ok) {
                setSavedText(text);
                setSavedTags(tags);

                if (firstSave) {
                    setTextId(data.textId);
                    setFirstSave(false);
                }
            } else {
                if (data.outdated) {
                    setOutdated(true);
                }
            }
        });

        return (mounted) => {
            if (!mounted) {
                request.willUnmount();
            }
        }
    });

    const saveOnUnmount = useOnCallEffect(() => {
        if (isSaved || saveInProgress || outdated || !authService.isAuthenticated) {
            return;
        }

        const api = firstSave ? '/api/item/resave' : '/api/item/update';
        const request = new Request();
        request.fetch(api, {
            text,
            tags,
            itemId,
            textId,
        }).then(({ok, data, error}) => {
            showRequestResult(ok, data, error);
        });
    });

    useHotkeys('ctrl+s', (event) => {
        event.preventDefault();

        if (blockSave || loading || outdated) {
            return;
        }
        saveIt();
    }, {
        enableOnTags: ["INPUT"],
    }, [blockSave, loading, outdated, saveIt]);

    useFullEffect(getLatest, []);

    useFullEffect(() => {
        return (mounted) => {
            if (!mounted) {
                saveOnUnmount();
            }
        }
    }, [saveOnUnmount]);

    function changeEditor(event, editor) {
        setText(editor.getData());
    }

    function changeTags(tags) {
        setTags(tags);
    }

    function handleOpenMenu(event) {
        setAnchorEl(event.currentTarget.parentElement);
    }

    function handleCloseMenu() {
        setAnchorEl(null);
    }

    function clickGetLatest() {
        if (loading) {
            return;
        }

        handleCloseMenu();
        getLatest();
    }

    function clickDelete() {
        if (loading) {
            return;
        }

        handleCloseMenu();
        setOpenDeleteDialog(true);
    }

    function reallyDelete() {
        handleCloseDeleteDialog();
        deleteIt();
    }

    function handleCloseDeleteDialog() {
        setOpenDeleteDialog(false);
    }

    function clickSave() {
        focusEditor();
        saveIt();
    }

    function showRequestResult(ok, data, error) {
        if (ok) {
            showSuccess(data.message);
        } else {
            showError(error);
        }
    }

    if (initLoading) {
        return <Loader/>;
    }

    return (
        <>
            <Title title="Edit"/>
            <Container component="main" maxWidth="md" className={classes.main}>
                <Box mt={2} mb={2} className={classes.editor}>
                    <CKEditor
                        editor={window.Editor || window.ClassicEditor}
                        config={editorConfig}
                        data={text}
                        onInit={initEditor}
                        onChange={changeEditor}
                        disabled={outdated}
                    />
                </Box>
                <Box mb={2}>
                    <Tags
                        value={tags}
                        onChange={changeTags}
                    />
                </Box>
                <Grid
                    container
                    justify="space-between"
                    spacing={2}
                >
                    <Grid item>
                        <div className={classes.menuParent}>
                            <Fab
                                color="primary"
                                aria-label="Actions"
                                size="small"
                                className={classes.menuFab}
                                onClick={handleOpenMenu}
                            >
                                <AddIcon />
                            </Fab>
                        </div>
                    </Grid>
                    <Menu
                        anchorEl={anchorEl}
                        getContentAnchorEl={null}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={isOpenMenu}
                        onClose={handleCloseMenu}
                        classes={{
                            paper: classes.paper,
                        }}
                    >
                        {outdated && <MenuItem
                            onClick={clickGetLatest}
                        >
                            Get latest
                        </MenuItem>}
                        <MenuItem
                            onClick={clickDelete}
                        >
                            Delete
                        </MenuItem>
                    </Menu>
                    <Grid
                        item
                        container
                        justify="flex-end"
                        className={classes.lastButtons}
                    >
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={clickSave}
                                disabled={blockSave || loading || outdated}
                            >
                                {firstSave ? 'Save' : 'Update'}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
            <DeleteDialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                onOk={reallyDelete}
            />
        </>
    );
}
