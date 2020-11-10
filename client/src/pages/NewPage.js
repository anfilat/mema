import React from 'react';
import _ from 'lodash';
import Hotkeys from 'react-hot-keys';
import CKEditor from '@ckeditor/ckeditor5-react';
import {Box, Button, Container, Grid, Backdrop} from "@material-ui/core";
import {SpeedDial, SpeedDialIcon, SpeedDialAction} from "@material-ui/lab";
import {Delete as DeleteIcon, Update as UpdateIcon} from '@material-ui/icons';
import {withStyles} from "@material-ui/core/styles";
import {withSnackbar} from 'notistack';
import Title from '../components/Title';
import Tags from '../components/Tags';
import {
    bindShowSuccess,
    bindShowError,
    editorHelper,
    editorConfig,
    editorStyles,
    request,
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
            openSpeedDial: false,
        };
        this.changeVars = changeVars;
        this.delVars = delVars;
        const {initEditor, focusEditor} = editorHelper();
        this.initEditor = initEditor;
        this.focusEditor = focusEditor;
        this.showSuccess = bindShowSuccess(this);
        this.showError = bindShowError(this);
        this.requestCancel = null;
    }

    componentWillUnmount() {
        this.stopRequest();

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
        request(this,
            '/api/item/get', {
                itemId: this.state.itemId,
            }
        ).then(this.onGetLatestResult);
    }

    onGetLatestResult = ({ok, data, error, abort}) => {
        if (abort) {
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
        } else {
            this.showError(error);
        }
    }

    deleteIt() {
        request(this,
            '/api/item/del', {
                itemId: this.state.itemId,
            }
        ).then(this.onDeleteItResult);
    }

    onDeleteItResult = ({ok, data, error, abort}) => {
        if (abort) {
            return;
        }

        if (ok) {
            this.clickReset();
            this.showSuccess(data.message);
        } else {
            this.showError(error);
        }
    }

    saveIt() {
        const {text, tags, textId} = this.state;
        if (this.inEditing()) {
            request(this,
                '/api/item/update', {
                    text,
                    tags,
                    itemId: this.state.itemId,
                    textId,
                }
            ).then(({ok, data, error, abort}) => {
                if (abort) {
                    return;
                }

                if (ok) {
                    this.changeVars({
                        savedText: text,
                        savedTags: tags,
                    });

                    this.showSuccess(data.message);
                } else {
                    if (data.outdated) {
                        this.setState({
                            outdated: true,
                        });
                    }
                    this.showError(error);
                }
            });
        } else {
            request(this,
                '/api/item/add', {
                    text,
                    tags,
                }
            ).then(({ok, data, error, abort}) => {
                if (abort) {
                    return;
                }

                if (ok) {
                    this.changeVars({
                        itemId: data.itemId,
                        textId: data.textId,
                        savedText: text,
                        savedTags: tags,
                    });

                    this.showSuccess(data.message);
                } else {
                    this.showError(error);
                }
            });
        }
    }

    stopRequest() {
        if (this.requestCancel) {
            this.requestCancel();
            this.requestCancel = null;
            this.setState({loading: false});
        }
    }

    render() {
        const {text, tags, loading, outdated, openSpeedDial} = this.state;
        const classes = this.props.classes;

        return (
            <Hotkeys
                keyName="ctrl+s"
                filter={() => true}
                onKeyDown={this.handleHotkey}
            >
                <Title title="New"/>
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
                        {(outdated || this.inEditing()) && <SpeedDial
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
                            {this.inEditing() && <SpeedDialAction
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
            </Hotkeys>
        );
    }
}

export default withStyles(editorStyles)(withSnackbar(NewPage));
