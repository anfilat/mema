export function editorHelper() {
    let editor = null;

    function initEditor(value) {
        editor = value;
        focusEditor({toEnd: true});
    }

    function focusEditor({toEnd} = {toEnd: false}) {
        editor.editing.view.focus();
        if (toEnd) {
            editor.model.change(writer => {
                writer.setSelection(writer.createPositionAt(editor.model.document.getRoot(), 'end'));
            });
        }
    }

    return {initEditor, focusEditor};
}

export const editorConfig = {
    toolbar: [
        "heading", "|",
        "bold", "italic", "strikethrough",  "|",
        "link", "bulletedList", "numberedList", "|",
        "alignment", "indent", "outdent", "|",
        "code", "codeBlock", "insertTable", "|",
        "undo", "redo"
    ],
};

export const editorStyles = theme => ({
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
                flexGrow: 1,
                flexBasis: 0,
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
    menuFab: {
        width: '36px',
        height: '36px',
    },
    menuParent: {
        paddingTop: `${theme.spacing(1)}px`,
        marginTop: `-${theme.spacing(1)}px`,
    },
});
