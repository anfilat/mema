import React from "react";
import {Button, Dialog, DialogActions, DialogTitle} from "@material-ui/core";

export default function DeleteDialog(props) {
    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Really delete this mem?
            </DialogTitle>
            <DialogActions>
                <Button
                    onClick={props.onOk}
                    variant="contained"
                    color="primary"
                    autoFocus
                >
                    Delete
                </Button>
                <Button
                    onClick={props.onClose}
                    color="secondary"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
