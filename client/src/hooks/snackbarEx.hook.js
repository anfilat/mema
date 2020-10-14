import {useCallback} from "react";
import {useSnackbar} from 'notistack';

export function useSnackbarEx() {
    const {enqueueSnackbar} = useSnackbar();

    const showSuccess = useCallback(function(message) {
        enqueueSnackbar(message, {
            variant: 'success',
        });
    }, []);

    const showError = useCallback(function(message) {
        enqueueSnackbar(message, {
            variant: 'error',
        });
    }, []);

    return {showSuccess, showError};
}
