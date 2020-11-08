export function bindShowSuccess(component) {
    const enqueueSnackbar = component.props.enqueueSnackbar;

    return function showSuccess(message) {
        enqueueSnackbar(message, {
            variant: 'success'
        })
    }
}

export function bindShowError(component) {
    const enqueueSnackbar = component.props.enqueueSnackbar;

    return function showError(message) {
        enqueueSnackbar(message, {
            variant: 'error'
        })
    }
}
