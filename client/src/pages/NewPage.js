import React from 'react';
import _ from 'lodash';
import Hotkeys from 'react-hot-keys';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid, Fab, Menu, MenuItem} from "@material-ui/core";
import {Add as AddIcon} from '@material-ui/icons';
import {withStyles} from "@material-ui/core/styles";
import {withSnackbar} from 'notistack';
import Title from '../components/Title';
import Tags from '../components/Tags';
import DeleteDialog from "../components/DeleteDialog";
import {
    bindShowSuccess,
    bindShowError,
    editorHelper,
    editorConfig,
    editorStyles,
    Request,
    localStorageVars,
} from '../utils';
import 'ckeditor5-custom-build/build/ckeditor';

const initialVars = {
    itemId: null,
    textId: null,
    text: '',
    tags: [],
    savedText: '',
    savedTags: [],
};

class NewPage extends React.Component {
    constructor(props) {
        super(props);
        const {vars, changeVars, delVars} = localStorageVars(this, 'newPage', initialVars);
        this.state = {
            ...vars,
            loading: false,
            outdated: false,
            anchorEl: null,
            openDeleteDialog: false,
        };
        this.changeVars = changeVars;
        this.delVars = delVars;
        const {initEditor, focusEditor} = editorHelper();
        this.initEditor = initEditor;
        this.focusEditor = focusEditor;
        this.showSuccess = bindShowSuccess(this);
        this.showError = bindShowError(this);
        this.request = new Request(this, {abortOnUnmount: false});
    }

    componentWillUnmount() {
        this.request.willUnmount();

        if (this.isSaved()) {
            this.delVars();
        }
    }

    inEditing() {
        return !!this.state.itemId;
    }

    isSaved() {
        const {text, tags, savedText, savedTags} = this.state;
        return text === savedText && _.isEqual(tags, savedTags);
    }

    blockSave() {
        const {text} = this.state;
        return this.isSaved() || (text.trim() === '');
    }

    changeEditor = (event, editor) => {
        this.changeVars({
            text: editor.getData(),
        });
    }

    setTags = (tags) => {
        this.changeVars({
            tags,
        });
    }

    handleOpenMenu = (event) => {
        this.setState({anchorEl: event.currentTarget.parentElement});
    }

    handleCloseMenu = () => {
        this.setState({anchorEl: null});
    }

    handleHotkey = (keyName, event) => {
        event.preventDefault();

        const {loading, outdated} = this.state;
        if (this.blockSave() || loading || outdated) {
            return;
        }
        this.saveIt();
    }

    clickReset = () => {
        this.changeVars({
            ...initialVars,
            outdated: false,
        });
        this.focusEditor();
    }

    clickGetLatest = () => {
        if (this.state.loading) {
            return;
        }

        this.handleCloseMenu();
        this.getLatest();
    }

    clickDelete = () => {
        if (this.state.loading) {
            return;
        }

        this.handleCloseMenu();
        this.setState({openDeleteDialog: true});
    }

    reallyDelete = () => {
        this.handleCloseDeleteDialog();
        this.deleteIt();
    }

    handleCloseDeleteDialog = () => {
        this.setState({openDeleteDialog: false});
    }

    clickSave = () => {
        this.focusEditor();
        this.saveIt();
    }

    getLatest() {
        this.request.fetch('/api/item/get', {
            itemId: this.state.itemId,
        }).then(this.onGetLatestResult);
    }

    onGetLatestResult = ({ok, data, error, exit}) => {
        if (!ok) {
            this.showError(error);
        }

        if (exit) {
            return;
        }

        if (ok) {
            const {textId, text, tags} = data;

            this.changeVars({
                textId,
                text,
                tags,
                savedText: text,
                savedTags: tags,
                outdated: false,
            });
        }
    }

    deleteIt() {
        this.request.fetch('/api/item/del', {
            itemId: this.state.itemId,
        }).then(this.onDeleteItResult);
    }

    onDeleteItResult = ({ok, data, error, exit}) => {
        this.showRequestResult(ok, data, error);

        if (exit) {
            return;
        }

        if (ok) {
            this.clickReset();
        }
    }

    saveIt() {
        const {text, tags, textId} = this.state;
        if (this.inEditing()) {
            this.request.fetch('/api/item/update', {
                text,
                tags,
                itemId: this.state.itemId,
                textId,
            }).then(({ok, data, error, exit}) => {
                this.showRequestResult(ok, data, error);

                if (exit) {
                    return;
                }

                if (ok) {
                    this.changeVars({
                        savedText: text,
                        savedTags: tags,
                    });
                } else {
                    if (data.outdated) {
                        this.setState({
                            outdated: true,
                        });
                    }
                }
            });
        } else {
            this.request.fetch('/api/item/add', {
                text,
                tags,
            }).then(({ok, data, error, exit}) => {
                this.showRequestResult(ok, data, error);

                if (exit) {
                    return;
                }

                if (ok) {
                    this.changeVars({
                        itemId: data.itemId,
                        textId: data.textId,
                        savedText: text,
                        savedTags: tags,
                    });
                }
            });
        }
    }

    showRequestResult(ok, data, error) {
        if (ok) {
            this.showSuccess(data.message);
        } else {
            this.showError(error);
        }
    }

    render() {
        const {text, tags, loading, outdated, anchorEl, openDeleteDialog} = this.state;
        const classes = this.props.classes;
        const isOpenMenu = Boolean(anchorEl);

        return (
            <Hotkeys
                keyName="ctrl+s"
                filter={() => true}
                onKeyDown={this.handleHotkey}
            >
                <Title title="New"/>
                <Container component="main" maxWidth="md" className={classes.main}>
                    <Box mt={2} mb={2} className={classes.editor}>
                        <CKEditor
                            editor={window.Editor || window.ClassicEditor}
                            config={editorConfig}
                            data={text}
                            onInit={this.initEditor}
                            onChange={this.changeEditor}
                            disabled={outdated}
                        />
                    </Box>
                    <Box mb={2}>
                        <Tags
                            value={tags}
                            onChange={this.setTags}
                        />
                    </Box>
                    <Grid
                        container
                        justify="space-between"
                        spacing={2}
                    >
                        {(outdated || this.inEditing()) && <Grid item>
                            <div className={classes.menuParent}>
                                <Fab
                                    color="primary"
                                    aria-label="Actions"
                                    size="small"
                                    className={classes.menuFab}
                                    onClick={this.handleOpenMenu}
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
                            onClose={this.handleCloseMenu}
                            classes={{
                                paper: classes.paper,
                            }}
                        >
                            {outdated && <MenuItem
                                onClick={this.clickGetLatest}
                            >
                                Get latest
                            </MenuItem>}
                            {this.inEditing() && <MenuItem
                                onClick={this.clickDelete}
                            >
                                Delete
                            </MenuItem>}
                        </Menu>
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
                                    onClick={this.clickReset}
                                    disabled={loading}
                                >
                                    Reset
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={this.clickSave}
                                    disabled={this.blockSave() || loading || outdated}
                                >
                                    {this.inEditing() ? 'Update' : 'Save'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
                <DeleteDialog
                    open={openDeleteDialog}
                    onClose={this.handleCloseDeleteDialog}
                    onOk={this.reallyDelete}
                />
            </Hotkeys>
        );
    }
}

export default withStyles(editorStyles)(withSnackbar(NewPage));
