import React, {useState} from 'react';
import _ from 'lodash';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid} from "@material-ui/core";
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
    }
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
    const isUpdate = !!itemId;
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
        if (isUpdate) {
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
        const {ok, data, error} = await request('/api/item/get', {itemId});
        if (ok) {
            setText(data.text);
            setTextId(data.textId);
            setOutdated(false);
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
                    {outdated && <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={clickGetLatest}
                            disabled={loading}
                        >
                            Get latest
                        </Button>
                    </Grid>}
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
                                {isUpdate ? 'Update' : 'Save'}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};
