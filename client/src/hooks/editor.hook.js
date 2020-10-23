import {useRef} from "react";

export const useEditor = () => {
    const editorInstance = useRef(null);

    function initEditor(editor) {
        editorInstance.current = editor;
        focusEditor({toEnd: true});
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

    return {initEditor, focusEditor};
}
