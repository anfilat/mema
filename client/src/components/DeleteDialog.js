import React from 'react';
import {Button, Dialog, DialogActions, DialogTitle} from '@material-ui/core';

export default function DeleteDialog(props) {
    const {open, onClose, onOk} = props;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Really delete this mem?
            </DialogTitle>
            <DialogActions>
                <Button
                    onClick={onOk}
                    variant="contained"
                    color="primary"
                    autoFocus
                >
                    Delete
                </Button>
                <Button
                    onClick={onClose}
                    color="secondary"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
