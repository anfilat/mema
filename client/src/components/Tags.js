import React, {useState} from 'react';
import _ from 'lodash';
import {TextField, CircularProgress} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {Autocomplete} from '@material-ui/lab';
import useFullEffect from 'fulleffect-hook';
import {Request} from '../utils';
import useDebounce from '../hooks/debounce.hook';
import useSnackbarEx from '../hooks/snackbarEx.hook';

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
});

export default function Tags(props) {
    const classes = useStyles();
    const {showError} = useSnackbarEx();
    const [open, setOpen] = useState(false);
    const [tags, setTags] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(0);
    const isLoading = loading > 0;
    const debouncedSearch = useDebounce(search, 200);

    function onOpen() {
        setOpen(true);
    }

    function onClose() {
        setOpen(false);
    }

    function onInputChange(event, value) {
        setSearch(value.trim());
    }

    function onChange(event, value) {
        if (props.onChange) {
            value = _.uniq(value.map(item => item.trim()));
            props.onChange(value);
        }
    }

    function filterTags(tags, params) {
        const filtered = [...tags];

        const input = params.inputValue.trim();
        if (input !== '' && !tags.includes(input) && !props.value.includes(input)) {
            filtered.push(input);
        }

        return filtered;
    }

    useFullEffect(() => {
        if (!open) {
            return;
        }

        let canceled = false;

        setLoading(val => val + 1);
        const request = new Request();
        request.fetch('/api/tag/list', {
            text: debouncedSearch,
            tags: props.value,
        }).then(({ok, data, error, exit}) => {
            if (error) {
                showError(error);
            }

            if (exit) {
                return;
            }

            setLoading(val => val - 1);

            if (ok && !canceled) {
                setTags(data.list);
            }
        });

        return (mounted) => {
            canceled = true;
            if (mounted) {
                request.stop();
            } else {
                request.willUnmount();
            }
        }
    }, [open, debouncedSearch]);

    useFullEffect(() => {
        if (!open) {
            setTags([]);
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
                filterOptions={filterTags}
                options={tags}
                loading={isLoading}
                renderInput={(params) =>
                    <TextField
                        {...params}
                        label="Tags"
                        variant="standard"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {isLoading ? <CircularProgress color="inherit" size={20}/> : null}
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
