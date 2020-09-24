import React from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Container} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Title} from '../components/Title';
import {useBindLocalStorage} from '../hooks/bindLocalStorage.hook';
const Editor = require('../ckeditor/build/ckeditor');

const useStyles = makeStyles(theme => ({
    editor: {
        '& .ck-editor': {
            height: `calc(100vh - 64px - ${theme.spacing(4)}px)`,
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
    const [content, setContent] = useBindLocalStorage('newData', 'content', '');

    function changeHandler(event, editor) {
        setContent(editor.getData());
    }

    return (
        <>
            <Title title="New"/>
            <Container component="main" maxWidth="md">
                <Box mt={2} className={classes.editor}>
                    <CKEditor
                        editor={ Editor }
                        config={config}
                        data={content}
                        onChange={changeHandler}
                    />
                </Box>
            </Container>
        </>
    );
};
