import React, {useState, useEffect} from "react";
import {TextField, CircularProgress} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Autocomplete} from "@material-ui/lab";
import {useDebounce} from '../hooks/debounce.hook';
import {useHttp} from "../hooks/http.hook";
import {useMounted} from '../hooks/mounted.hook';
import {useSnackbarEx} from "../hooks/snackbarEx.hook";

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
});

export function Tags(props) {
    const classes = useStyles();
    const {showError} = useSnackbarEx();
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 200);
    const {loading, request} = useHttp();
    const mounted = useMounted();

    function onOpen() {
        setOpen(true);
    }

    function onClose() {
        setOpen(false);
    }

    function onInputChange(event, value) {
        setSearch(value);
    }

    function onChange(event, value) {
        if (props.onChange) {
            props.onChange(value);
        }
    }

    function filterOptions(options, params) {
        const filtered = [...options];

        const input = params.inputValue;
        if (input !== '' && !options.includes(input) && !props.value.includes(input)) {
            filtered.push(params.inputValue);
        }

        return filtered;
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        request('/api/tag/list', {
            text: debouncedSearch,
            tags: props.value,
        }).then(({ok, data, error}) => {
            if (!mounted.current) {
                return;
            }

            if (ok) {
                setOptions(data.list);
            } else {
                showError(error);
            }
        });
    }, [open, debouncedSearch, request, showError, props.value, mounted]);

    useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

    return (
        <div className={classes.root}>
            <Autocomplete
                selectOnFocus
                freeSolo
                multiple
                open={open}
                onOpen={onOpen}
                onClose={onClose}
                inputValue={search}
                onInputChange={onInputChange}
                value={props.value}
                onChange={onChange}
                filterOptions={filterOptions}
                options={options}
                loading={loading}
                renderInput={(params) =>
                    <TextField
                        {...params}
                        label="Tags"
                        variant="standard"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                }
            />
        </div>
    );
}
