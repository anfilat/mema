import {useState, useCallback} from 'react';
import useOnCallEffect from "oncalleffect-hook";
import useSnackbarEx from "./snackbarEx.hook";
import {Request} from "../utils";

export default function useDeleteItem(id, remove) {
    const {showSuccess, showError} = useSnackbarEx();
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(false);

    const clickDelete = useCallback(() => {
        setOpenDeleteDialog(true);
    }, []);

    const reallyDelete = useCallback(() => {
        handleCloseDeleteDialog();
        deleteIt();
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setOpenDeleteDialog(false);
    }, []);

    const deleteIt = useOnCallEffect(() => {
        setLoading(true);

        const request = new Request({abortOnUnmount: false});
        request.fetch('/api/item/del', {
            itemId: id,
        }).then(({ok, data, error, exit}) => {
            showRequestResult(ok, data, error);

            if (exit) {
                return;
            }

            setLoading(false);

            if (ok) {
                remove(id);
            }
        });

        return (mounted) => {
            if (!mounted) {
                request.willUnmount();
            }
        }
    });

    function showRequestResult(ok, data, error) {
        if (ok) {
            showSuccess(data.message);
        } else {
            showError(error);
        }
    }

    return {clickDelete, reallyDelete, handleCloseDeleteDialog, openDeleteDialog, loading};
}
