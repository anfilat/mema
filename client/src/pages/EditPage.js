import React from 'react';
import {withRouter} from 'react-router-dom';
import _ from 'lodash';
import Hotkeys from 'react-hot-keys';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid, Fab, Menu, MenuItem} from "@material-ui/core";
import {Add as AddIcon} from '@material-ui/icons';
import {withStyles} from "@material-ui/core/styles";
import {withSnackbar} from 'notistack';
import authService from "../services/auth";
import history from "../services/history";
import Loader from '../components/Loader';
import Title from '../components/Title';
import Tags from '../components/Tags';
import DeleteDialog from "../components/DeleteDialog";
import {bindShowSuccess, bindShowError, editorHelper, editorConfig, editorStyles, Request} from '../utils';
import 'ckeditor5-custom-build/build/ckeditor';

class EditPage extends React.Component {
    constructor(props) {
        super(props);
        this.itemId = props.match.params.id;
        this.state = {
            initLoading: true,
            textId: null,
            text: '',
            tags: [],
            savedText: '',
            savedTags: [],
            firstSave: true,
            loading: false,
            outdated: false,
            anchorEl: null,
            openDeleteDialog: false,
        };
        const {initEditor, focusEditor} = editorHelper();
        this.initEditor = initEditor;
        this.focusEditor = focusEditor;
        this.showSuccess = bindShowSuccess(this);
        this.showError = bindShowError(this);
        this.request = new Request(this, {abortOnUnmount: false});
        this.saveInProgress = false;
    }

    componentDidMount() {
        this.getLatest()
    }

    componentWillUnmount() {
        this.request.willUnmount();
        this.saveOnUnmount();
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
        this.setState({text: editor.getData()});
    }

    setTags = (tags) => {
        this.setState({tags});
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
            itemId: this.itemId,
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

            this.setState({
                textId,
                text,
                tags,
                savedText: text,
                savedTags: tags,
                outdated: false,
                initLoading: false,
            });
        } else {
            history.push('/items');
        }
    }

    deleteIt() {
        this.request.fetch('/api/item/del', {
            itemId: this.itemId,
        }).then(this.onDeleteItResult);
    }

    onDeleteItResult = ({ok, data, error, exit}) => {
        this.showRequestResult(ok, data, error);

        if (exit) {
            return;
        }

        if (ok) {
            history.push('/items');
        }
    }

    saveIt() {
        const {text, tags, textId, firstSave} = this.state;
        const api = firstSave ? '/api/item/resave' : '/api/item/update';
        this.saveInProgress = true;
        this.request.fetch(api, {
            text,
            tags,
            itemId: this.itemId,
            textId,
        }).then(({ok, data, error, exit}) => {
            this.saveInProgress = false;
            this.showRequestResult(ok, data, error);

            if (exit) {
                return;
            }

            if (ok) {
                this.setState({
                    savedText: text,
                    savedTags: tags,
                });

                if (firstSave) {
                    this.setState({
                        textId: data.textId,
                        firstSave: false,
                    });
                }
            } else {
                if (data.outdated) {
                    this.setState({
                        outdated: true,
                    });
                }
            }
        });
    }

    saveOnUnmount() {
        if (this.isSaved() || this.saveInProgress || this.state.outdated || !authService.isAuthenticated) {
            return;
        }

        const {text, tags, textId, firstSave} = this.state;
        const api = firstSave ? '/api/item/resave' : '/api/item/update';
        const request = new Request(this, {silent: true});
        request.fetch(api, {
            text,
            tags,
            itemId: this.itemId,
            textId,
        }).then(({ok, data, error}) => {
            this.showRequestResult(ok, data, error);
        });
    }

    showRequestResult(ok, data, error) {
        if (ok) {
            this.showSuccess(data.message);
        } else {
            this.showError(error);
        }
    }

    render() {
        const {initLoading, text, tags, firstSave, loading, outdated, anchorEl, openDeleteDialog} = this.state;
        const classes = this.props.classes;
        const isOpenMenu = Boolean(anchorEl);

        if (initLoading) {
            return <Loader/>;
        }

        return (
            <Hotkeys
                keyName="ctrl+s"
                filter={() => true}
                onKeyDown={this.handleHotkey}
            >
                <Title title="Edit"/>
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
                        <Grid item>
                            <div className={classes.menuParent}>
                                <Fab
                                    color="primary"
                                    aria-label="Actions"
                                    size="small"
                                    className={classes.menuFab}
                                    onClick={this.handleOpenMenu}
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
                            <MenuItem
                                onClick={this.clickDelete}
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
                                    onClick={this.clickSave}
                                    disabled={this.blockSave() || loading || outdated}
                                >
                                    {firstSave ? 'Save' : 'Update'}
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
        )
    }
}

export default withStyles(editorStyles)(withSnackbar(withRouter(EditPage)));
