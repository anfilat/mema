import React, {useState} from 'react';
import _ from 'lodash';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid, Backdrop} from "@material-ui/core";
import {SpeedDial, SpeedDialIcon, SpeedDialAction} from "@material-ui/lab";
import {Delete as DeleteIcon, Update as UpdateIcon} from '@material-ui/icons';
import {makeStyles} from "@material-ui/core/styles";
import {Title} from '../components/Title';
import {Tags} from '../components/Tags';
import {useBindLocalStorage} from '../hooks/bindLocalStorage.hook';
import {useEditor} from '../hooks/editor.hook';
import {useHttp} from '../hooks/http.hook';
import {useSnackbarEx} from '../hooks/snackbarEx.hook';
import 'ckeditor5-custom-build/build/ckeditor';

const useStyles = makeStyles(theme => ({
    main: {
        height: `calc(100vh - 64px - ${theme.spacing(2)}px)`,
        display: 'flex',
        'flex-direction': 'column',
        position: 'relative',
    },
    editor: {
        'flex-grow': 1,
        '& .ck-editor': {
            height: '100%',
            display: 'flex',
            'flex-direction': 'column',
            '& .ck-editor__main': {
                'flex-grow': 1,
                overflow: 'auto',
                '& .ck-content': {
                    height: '100%',
                }
            }
        }
    },
    lastButtons: {
        'flex-basis': 0,
        'flex-grow': 1,
    },
    speedDial: {
        position: 'absolute',
        bottom: 0,
        left: theme.spacing(2),
    },
    speedDialFab: {
        width: '36px',
        height: '36px',
    },
    speedDialActions: {
        'padding-bottom': `${theme.spacing(5)}px !important`,
    },
    speedActionTooltip: {
        'white-space': 'nowrap',
    },
    speedActionFab: {
        width: '36px',
        height: '36px',
    },
}));

const config = {
    toolbar: [
        "heading", "|",
        "bold", "italic", "strikethrough",  "|",
        "link", "bulletedList", "numberedList", "|",
        "alignment", "indent", "outdent", "|",
        "code", "codeBlock", "insertTable", "|",
        "undo", "redo"
    ],
};

export const NewPage = () => {
    const classes = useStyles();
    const {initEditor, focusEditor} = useEditor();
    const {showSuccess, showError} = useSnackbarEx();
    const {loading, request} = useHttp();
    const [text, setText] = useBindLocalStorage('newPageText', '');
    const [itemId, setItemId] = useBindLocalStorage('newPageItemId', null);
    const [textId, setTextId] = useBindLocalStorage('newPageTextId', null);
    const [tags, setTags] = useBindLocalStorage('newPageTags', []);
    const [outdated, setOutdated] = useState(false);
    const [savedText, setSavedText] = useBindLocalStorage('newPageSavedText', '');
    const [savedTags, setSavedTags] = useBindLocalStorage('newPageSavedTags', []);
    const [openSpeedDial, setOpenSpeedDial] = useState(false);
    const inEditing = !!itemId;
    const blockSave = (text.trim() === '') ||
        (text === savedText && _.isEqual(tags, savedTags));

    function changeEditor(event, editor) {
        setText(editor.getData());
    }

    function clickReset() {
        setText('');
        setTags([]);
        setSavedText('');
        setSavedTags([]);
        setItemId(null);
        setTextId(null);
        setOutdated(false);
        focusEditor();
    }

    async function clickSave() {
        if (inEditing) {
            await updateItem();
        } else {
            await addItem();
        }
        focusEditor();
    }

    async function addItem() {
        const {ok, data, error} = await request('/api/item/add', {
            text,
            tags,
        });
        if (ok) {
            setItemId(data.itemId);
            setTextId(data.textId);
            setSavedText(text);
            setSavedTags(tags);

            showSuccess(data.message);
        } else {
            showError(error);
        }
    }

    async function updateItem() {
        const {ok, data, error} = await request('/api/item/update', {
            text,
            tags,
            itemId,
            textId,
        });
        if (ok) {
            setSavedText(text);
            setSavedTags(tags);

            showSuccess(data.message);
        } else {
            if (data.outdated) {
                setOutdated(true);
            }
            showError(error);
        }
    }

    async function clickGetLatest() {
        if (loading) {
            return;
        }

        setOpenSpeedDial(false);
        const {ok, data, error} = await request('/api/item/get', {itemId});
        if (ok) {
            const {textId, text, tags} = data;

            setTextId(textId);
            setText(text);
            setTags(tags);

            setSavedText(text);
            setSavedTags(tags);

            setOutdated(false);
        } else {
            showError(error);
        }
    }

    async function clickDelete() {
        if (loading) {
            return;
        }

        setOpenSpeedDial(false);
        const {ok, data, error} = await request('/api/item/del', {itemId});
        if (ok) {
            clickReset();
            showSuccess(data.message);
        } else {
            showError(error);
        }
    }

    function handleOpenSpeedDial() {
        setOpenSpeedDial(true);
    }

    function handleCloseSpeedDial() {
        setOpenSpeedDial(false);
    }

    return (
        <>
            <Title title="New"/>
            <Container component="main" maxWidth="md" className={classes.main}>
                <Backdrop open={openSpeedDial} />
                <Box mt={2} mb={2} className={classes.editor}>
                    <CKEditor
                        editor={ window.Editor || window.ClassicEditor }
                        config={config}
                        data={text}
                        onInit={initEditor}
                        onChange={changeEditor}
                        disabled={outdated}
                    />
                </Box>
                <Box mb={2}>
                    <Tags
                        value={tags}
                        onChange={setTags}
                    />
                </Box>
                <Grid
                    container
                    justify="space-between"
                    spacing={2}
                >
                    {(outdated || inEditing) && <SpeedDial
                        ariaLabel="Actions"
                        classes={{
                            root: classes.speedDial,
                            fab: classes.speedDialFab,
                            actions: classes.speedDialActions,
                        }}
                        icon={<SpeedDialIcon />}
                        onClose={handleCloseSpeedDial}
                        onOpen={handleOpenSpeedDial}
                        open={openSpeedDial}
                    >
                        {outdated && <SpeedDialAction
                            key="GetLatest"
                            icon={<UpdateIcon/>}
                            tooltipTitle="Get latest"
                            tooltipPlacement="right"
                            tooltipOpen
                            classes={{
                                fab: classes.speedActionFab,
                                tooltipPlacementRight: classes.speedActionTooltip,
                            }}
                            onClick={clickGetLatest}
                        />}
                        (inEditing && <SpeedDialAction
                            key="Delete"
                            icon={<DeleteIcon/>}
                            tooltipTitle="Delete"
                            tooltipPlacement="right"
                            tooltipOpen
                            classes={{
                                fab: classes.speedActionFab,
                                tooltipPlacementRight: classes.speedActionTooltip,
                            }}
                            onClick={clickDelete}
                        />}
                    </SpeedDial>}
                    <Grid
                        item
                        container
                        justify="flex-end"
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
        </>
    );
};
