import React, {useState} from 'react';
import _ from 'lodash';
import {useHotkeys} from 'react-hotkeys-hook';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid, Fab, Menu, MenuItem} from '@material-ui/core';
import {Add as AddIcon} from '@material-ui/icons';
import {makeStyles} from '@material-ui/core/styles';
import useFullEffect from "fulleffect-hook";
import useOnCallEffect from "oncalleffect-hook";
import Title from '../components/Title';
import Tags from '../components/Tags';
import DeleteDialog from '../components/DeleteDialog';
import {editorConfig, editorStyles, Request} from '../utils';
import useLocalStorageVars from '../hooks/bindLocalStorage.hook';
import useEditor from '../hooks/editor.hook';
import useSnackbarEx from '../hooks/snackbarEx.hook';
import 'ckeditor5-custom-build/build/ckeditor';

const useStyles = makeStyles(editorStyles);

const initialVars = {
    itemId: null,
    textId: null,
    text: '',
    tags: [],
    savedText: '',
    savedTags: [],
};

export default function NewPage() {
    const classes = useStyles();
    const {initEditor, focusEditor} = useEditor();
    const {showSuccess, showError} = useSnackbarEx();
    const [{
        itemId,
        textId,
        text,
        tags,
        savedText,
        savedTags,
    }, changeVars, delVars] = useLocalStorageVars('newPage', initialVars);
    const [loading, setLoading] = useState(false);
    const [outdated, setOutdated] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const isOpenMenu = Boolean(anchorEl);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const inEditing = !!itemId;
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

            changeVars({
                textId,
                text,
                tags,
                savedText: text,
                savedTags: tags,
            });
            setOutdated(false);
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
                clickReset();
            }
        });

        return (mounted) => {
            if (!mounted) {
                request.willUnmount();
            }
        }
    });

    const saveIt = useOnCallEffect(() => {
        setLoading(true);

        const request = new Request({abortOnUnmount: false});
        if (inEditing) {
            request.fetch('/api/item/update', {
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

                if (ok) {
                    changeVars({
                        savedText: text,
                        savedTags: tags,
                    });
                } else {
                    if (data.outdated) {
                        setOutdated(true);
                    }
                }
            });
        } else {
            request.fetch('/api/item/add', {
                text,
                tags,
            }).then(({ok, data, error, exit}) => {
                showRequestResult(ok, data, error);

                if (exit) {
                    return;
                }

                setLoading(false);

                if (ok) {
                    changeVars({
                        itemId: data.itemId,
                        textId: data.textId,
                        savedText: text,
                        savedTags: tags,
                    });
                }
            });
        }

        return (mounted) => {
            if (!mounted) {
                request.willUnmount();
            }
        }
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

    useFullEffect(() => {
        return (mounted) => {
            if (!mounted && isSaved) {
                delVars();
            }
        }
    }, [isSaved, delVars]);

    function changeEditor(event, editor) {
        changeVars({
            text: editor.getData(),
        });
    }

    function changeTags(tags) {
        changeVars({
            tags,
        });
    }

    function handleOpenMenu(event) {
        setAnchorEl(event.currentTarget.parentElement);
    }

    function handleCloseMenu() {
        setAnchorEl(null);
    }

    function clickReset() {
        changeVars({
            ...initialVars,
        });
        setOutdated(false);
        focusEditor();
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

    return (
        <>
            <Title title="New"/>
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
                    justifyContent="space-between"
                    spacing={2}
                >
                    {(outdated || inEditing) && <Grid item>
                        <div className={classes.menuParent}>
                            <Fab
                                color="primary"
                                aria-label="Actions"
                                size="small"
                                className={classes.menuFab}
                                onClick={handleOpenMenu}
                            >
                                <AddIcon/>
                            </Fab>
                        </div>
                    </Grid>}
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
                        {inEditing && <MenuItem
                            onClick={clickDelete}
                        >
                            Delete
                        </MenuItem>}
                    </Menu>
                    <Grid
                        item
                        container
                        justifyContent="flex-end"
                        spacing={2}
                        className={classes.lastButtons}
                    >
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={clickReset}
                                disabled={loading}
                            >
                                Reset
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={clickSave}
                                disabled={blockSave || loading || outdated}
                            >
                                {inEditing ? 'Update' : 'Save'}
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
