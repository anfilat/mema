import {useCallback} from 'react';
import {useSnackbar} from 'notistack';

export default function useSnackbarEx() {
    const {enqueueSnackbar} = useSnackbar();

    const showSuccess = useCallback(function(message) {
        enqueueSnackbar(message, {
            variant: 'success',
        });
    }, [enqueueSnackbar]);

    const showError = useCallback(function(message) {
        enqueueSnackbar(message, {
            variant: 'error',
        });
    }, [enqueueSnackbar]);

    return {showSuccess, showError};
}
