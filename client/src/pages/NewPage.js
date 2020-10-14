import React, {useRef, useState} from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Title} from '../components/Title';
import {useBindLocalStorage} from '../hooks/bindLocalStorage.hook';
import {useHttp} from '../hooks/http.hook';
import {useSnackbarEx} from '../hooks/snackbarEx.hook';
import 'ckeditor5-custom-build/build/ckeditor';

const useStyles = makeStyles(theme => ({
    editor: {
        '& .ck-editor': {
            height: `calc(100vh - 64px - ${theme.spacing(6)}px - 36px)`,
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
    const editorInstance = useRef(null);
    const {showSuccess, showError} = useSnackbarEx();
    const {loading, request} = useHttp();
    const [text, setText] = useBindLocalStorage('newPageText', '');
    const [itemId, setItemId] = useBindLocalStorage('newPageItemId', null);
    const [textId, setTextId] = useBindLocalStorage('newPageTextId', null);
    const [outdated, setOutdated] = useState(false);

    function initEditor(editor) {
        editorInstance.current = editor;
        focusEditor({toEnd: true});
    }

    function changeEditor(event, editor) {
        setText(editor.getData());
    }

    function clickReset() {
        setText('');
        setItemId(null);
        setTextId(null);
        focusEditor();
    }

    async function clickSave() {
        if (!itemId) {
            await addItem();
        } else {
            await updateItem();
        }
        focusEditor();
    }

    async function addItem() {
        const {ok, data, error} = await request('/api/item/add', {
            text
        });
        if (ok) {
            setItemId(data.itemId);
            setTextId(data.textId);

            showSuccess(data.message);
        } else {
            showError(error);
        }
    }

    async function updateItem() {
        const {ok, data, error} = await request('/api/item/update', {
            text,
            itemId,
            textId,
        });
        if (ok) {
            showSuccess(data.message);
        } else {
            if (data.outdated) {
                setOutdated(true);
            }
            showError(error);
        }
    }

    function focusEditor({toEnd} = {toEnd: false}) {
        const editor = editorInstance.current;
        editor.editing.view.focus();
        if (toEnd) {
            editor.model.change(writer => {
                writer.setSelection(writer.createPositionAt(editor.model.document.getRoot(), 'end'));
            });
        }
    }

    return (
        <>
            <Title title="New"/>
            <Container component="main" maxWidth="md">
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
                <Grid
                    container
                    direction="row"
                    justify="flex-end"
                    spacing={2}
                >
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={clickReset}
                            disabled={loading || outdated}
                        >
                            Reset
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={clickSave}
                            disabled={loading || outdated}
                        >
                            Save
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};
