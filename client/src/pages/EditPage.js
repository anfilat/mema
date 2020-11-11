import React from 'react';
import {withRouter} from 'react-router-dom';
import _ from 'lodash';
import Hotkeys from 'react-hot-keys';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid, Backdrop} from "@material-ui/core";
import {SpeedDial, SpeedDialIcon, SpeedDialAction} from "@material-ui/lab";
import {Delete as DeleteIcon, Update as UpdateIcon} from '@material-ui/icons';
import {withStyles} from "@material-ui/core/styles";
import {withSnackbar} from 'notistack';
import history from "../services/history";
import Loader from '../components/Loader';
import Title from '../components/Title';
import Tags from '../components/Tags';
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
            openSpeedDial: false,
        };
        const {initEditor, focusEditor} = editorHelper();
        this.initEditor = initEditor;
        this.focusEditor = focusEditor;
        this.showSuccess = bindShowSuccess(this);
        this.showError = bindShowError(this);
        this.request = new Request(this, {abortOnUnmount: false});
        this.saveInProgress = false;
        setTimeout(() => this.getLatest(), 0);
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

    handleOpenSpeedDial = () => {
        this.setState({openSpeedDial: true});
    }

    handleCloseSpeedDial = () => {
        this.setState({openSpeedDial: false});
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

        this.setState({openSpeedDial: false});
        this.getLatest();
    }

    clickDelete = () => {
        if (this.state.loading) {
            return;
        }

        this.setState({openSpeedDial: false});
        this.deleteIt();
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

    onGetLatestResult = ({ok, data, error, aborted}) => {
        if (aborted) {
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
            this.showError(error);
            history.push('/items');
        }
    }

    deleteIt() {
        this.request.fetch('/api/item/del', {
            itemId: this.itemId,
        }).then(this.onDeleteItResult);
    }

    onDeleteItResult = ({ok, data, error, aborted}) => {
        if (aborted) {
            return;
        }

        if (ok) {
            this.showSuccess(data.message);
            history.push('/items');
        } else {
            this.showError(error);
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
        }).then(({ok, data, error, aborted, unmounted}) => {
            this.saveInProgress = false;

            if (unmounted || !aborted) {
                this.showSaveResult(ok, data, error);
            }

            if (aborted) {
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
        if (this.isSaved() || this.saveInProgress || this.state.outdated) {
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
            this.showSaveResult(ok, data, error);
        });
    }

    showSaveResult(ok, data, error) {
        if (ok) {
            this.showSuccess(data.message);
        } else {
            this.showError(error);
        }
    }

    render() {
        const {initLoading, text, tags, firstSave, loading, outdated, openSpeedDial} = this.state;
        const classes = this.props.classes;

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
                    <Backdrop open={openSpeedDial}/>
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
                        <SpeedDial
                            ariaLabel="Actions"
                            classes={{
                                root: classes.speedDial,
                                fab: classes.speedDialFab,
                                actions: classes.speedDialActions,
                            }}
                            icon={<SpeedDialIcon/>}
                            onClose={this.handleCloseSpeedDial}
                            onOpen={this.handleOpenSpeedDial}
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
                                onClick={this.clickGetLatest}
                            />}
                            <SpeedDialAction
                                key="Delete"
                                icon={<DeleteIcon/>}
                                tooltipTitle="Delete"
                                tooltipPlacement="right"
                                tooltipOpen
                                classes={{
                                    fab: classes.speedActionFab,
                                    tooltipPlacementRight: classes.speedActionTooltip,
                                }}
                                onClick={this.clickDelete}
                            />
                        </SpeedDial>
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
                                    onClick={this.clickSave}
                                    disabled={this.blockSave() || loading || outdated}
                                >
                                    {firstSave ? 'Save' : 'Update'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            </Hotkeys>
        )
    }
}

export default withStyles(editorStyles)(withSnackbar(withRouter(EditPage)));
