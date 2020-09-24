import React from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Container} from "@material-ui/core";
import {Title} from '../components/Title';
import {useBindLocalStorage} from '../hooks/bindLocalStorage.hook';
const Editor = require('../ckeditor/build/ckeditor');

const config = {
    toolbar: [
        "heading", "|",
        "bold", "italic", "strikethrough",  "|",
        "link", "bulletedList", "numberedList", "|",
        "alignment", "indent", "outdent", "|",
        "blockQuote", "codeBlock", "code", "insertTable", "undo", "redo"
    ],
};

export const NewPage = () => {
    const [content, setContent] = useBindLocalStorage('newData', 'content', '');

    function changeHandler(event, editor) {
        setContent(editor.getData());
    }

    return (
        <>
            <Title title="New"/>
            <Container component="main" maxWidth="md">
                <Box mt={2}>
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
